from sqlalchemy.orm import Session
from app import models, schemas
from app.services.device_status_service import status_exists
from app.crud.status import change_device_status
from sqlmodel import select

def get_device(db: Session, device_id: int):
    return db.exec(
        select(models.Device).where(
            models.Device.device_id == device_id
        )
    ).first()


def get_devices(db: Session):
    return db.exec(select(models.Device)).all()


def create_device(db: Session, device: schemas.DeviceCreate):
    db_device = models.Device(**device.model_dump())
    initial_status = db_device.status

    if not status_exists(db, initial_status):
        raise ValueError(
            f"Invalid status: {initial_status}"
        )
    db.add(db_device)
    db.commit()
    db.refresh(db_device)
    # Initial status log
    # log = models.DeviceStatusLog(
    #     device_id=db_device.device_id,
    #     from_status=None,
    #     to_status=initial_status,
    #     note="Initial device creation"
    # )

    # db.add(log)
    # db.commit()

    return db_device


def update_device(db: Session, device_id: int, device: schemas.DeviceUpdate):
    db_device = get_device(db, device_id)
    if not db_device:
        return None

    update_device = device.model_dump(
        exclude_unset=True
    )

    # Prevent direct status updates
    update_device.pop("status", None)

    for key, value in update_device.items():
        setattr(db_device, key, value)

    db.commit()
    db.refresh(db_device)
    return db_device


def delete_device(db: Session, device_id: int, changed_by: str | None = None):
    payload = schemas.StatusChangeRequest(
        to_status="retired",
        changed_by=changed_by,
        note="Device retired"
    )

    return change_device_status(
            db=db,
            device_id=device_id,
            payload=payload
        )