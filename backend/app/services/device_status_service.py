from sqlalchemy.orm import Session
from app import models


def status_exists(db: Session, status: str) -> bool:
    return db.query(models.DeviceStatus).filter(
        models.DeviceStatus.status == status
    ).first() is not None


def is_valid_transition(
    db: Session,
    from_status: str,
    to_status: str
) -> bool:
    return db.query(models.DeviceStatusTransition).filter(
        models.DeviceStatusTransition.from_status == from_status,
        models.DeviceStatusTransition.to_status == to_status
    ).first() is not None


