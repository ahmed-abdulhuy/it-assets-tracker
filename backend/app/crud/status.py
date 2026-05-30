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


def change_computer_status(db: Session, computer_id: int, payload: schemas.StatusChangeRequest):
    # 1. Load computer
    computer = db.query(models.Computer).filter(
        models.Computer.computer_id == computer_id
    ).first()
    if not computer:
        raise HTTPException(http_status.HTTP_404_NOT_FOUND, detail=f"Computer {computer_id} not found.")

    current = computer.status
    target  = payload.to_status

    if current == target:
        raise HTTPException(http_status.HTTP_409_CONFLICT,
                            detail=f"Computer is already in '{target}' status.")

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
        active = db.query(models.ComputerAssignment).filter(
            models.ComputerAssignment.computer_id == computer_id,
            models.ComputerAssignment.returned_at == None  # noqa: E711
        ).first()
        if active:
            active.returned_at  = datetime.now(timezone.utc)

    # 5. Apply status change
    computer.status = target

    # 6. Write audit log
    db.add(models.DeviceStatusLog(
        computer_id = computer_id,
        from_status = current,
        to_status   = target,
        changed_by  = payload.changed_by,
        note        = payload.note,
    ))

    db.commit()
    db.refresh(computer)
    return computer


def get_status_log(db: Session, computer_id: int):
    computer = db.query(models.Computer).filter(
        models.Computer.computer_id == computer_id
    ).first()
    if not computer:
        raise HTTPException(http_status.HTTP_404_NOT_FOUND, detail=f"Computer {computer_id} not found.")
    return (
        db.query(models.DeviceStatusLog)
        .filter(models.DeviceStatusLog.computer_id == computer_id)
        .order_by(models.DeviceStatusLog.changed_at.desc())
        .all()
    )