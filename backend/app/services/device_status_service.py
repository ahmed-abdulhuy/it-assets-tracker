from app import models
from sqlmodel import select, Session


def status_exists(db: Session, status: str) -> bool:
    statement = select(models.DeviceStatus).where(models.DeviceStatus.status == status)
    result = db.exec(statement).first()
    return result is not None


def is_valid_transition(
    db: Session,
    from_status: str,
    to_status: str
) -> bool:
    statement = select(models.DeviceStatusTransition).where(
        models.DeviceStatusTransition.from_status == from_status,
        models.DeviceStatusTransition.to_status == to_status
    )
    result = db.exec(statement).first()
    return result is not None