from datetime import datetime, timezone
from sqlalchemy.orm import Session
from fastapi import HTTPException, status as http_status
from app import models, schemas


def get_all_statuses(db: Session):
    return db.query(models.DeviceStatus).all()


def get_transitions_from(db: Session, from_status: str):
    return (
        db.query(models.DeviceStatusTransition)
        .filter(models.DeviceStatusTransition.from_status == from_status)
        .all()
    )


def change_device_status(db: Session, device_id: int, payload: schemas.StatusChangeRequest):
    # 1. Load device
    device = db.query(models.Device).filter(
        models.Device.device_id == device_id
    ).first()
    if not device:
        raise HTTPException(http_status.HTTP_404_NOT_FOUND, detail=f"Device {device_id} not found.")

    current = device.status
    target  = payload.to_status

    if current == target:
        raise HTTPException(http_status.HTTP_409_CONFLICT,
                            detail=f"Device is already in '{target}' status.")

    # 2. Verify transition is allowed
    transition = db.query(models.DeviceStatusTransition).filter(
        models.DeviceStatusTransition.from_status == current,
        models.DeviceStatusTransition.to_status   == target,
    ).first()
    if not transition:
        raise HTTPException(http_status.HTTP_422_UNPROCESSABLE_ENTITY,
                            detail=f"Transition from '{current}' to '{target}' is not allowed.")

    # 3. Verify target status exists
    if not db.query(models.DeviceStatus).filter(models.DeviceStatus.status == target).first():
        raise HTTPException(http_status.HTTP_400_BAD_REQUEST, detail=f"Unknown status '{target}'.")

    # 4. If transition requires_return, close active assignment
    if transition.requires_return:
        active = db.query(models.DeviceAssignment).filter(
            models.DeviceAssignment.device_id == device_id,
            models.DeviceAssignment.returned_at == None  # noqa: E711
        ).first()
        if active:
            active.returned_at  = datetime.now(timezone.utc)

    # 5. Apply status change
    device.status = target

    # 6. Write audit log
    db.add(models.DeviceStatusLog(
        device_id = device_id,
        from_status = current,
        to_status   = target,
        changed_by  = payload.changed_by,
        note        = payload.note,
    ))

    db.commit()
    db.refresh(device)
    return device


def get_status_log(db: Session, device_id: int):
    device = db.query(models.Device).filter(
        models.Device.device_id == device_id
    ).first()
    if not device:
        raise HTTPException(http_status.HTTP_404_NOT_FOUND, detail=f"Device {device_id} not found.")
    return (
        db.query(models.DeviceStatusLog)
        .filter(models.DeviceStatusLog.device_id == device_id)
        .order_by(models.DeviceStatusLog.changed_at.desc())
        .all()
    )