from sqlalchemy.orm import Session
from app import models, schemas
from app.services.computer_status_service import status_exists
from app.crud.status import change_computer_status

def get_computer(db: Session, computer_id: int):
    return db.query(models.Computer).filter(
        models.Computer.computer_id == computer_id
    ).first()


def get_computers(db: Session):
    return db.query(models.Computer).all()


def create_computer(db: Session, computer: schemas.ComputerCreate):
    db_computer = models.Computer(**computer.model_dump())
    initial_status = db_computer.status

    if not status_exists(db, initial_status):
        raise ValueError(
            f"Invalid status: {initial_status}"
        )
    db.add(db_computer)
    db.commit()
    db.refresh(db_computer)
    # Initial status log
    log = models.DeviceStatusLog(
        computer_id=db_computer.computer_id,
        from_status=None,
        to_status=initial_status,
        note="Initial device creation"
    )

    db.add(log)
    db.commit()

    return db_computer


def update_computer(db: Session, computer_id: int, computer: schemas.ComputerUpdate):
    db_computer = get_computer(db, computer_id)
    if not db_computer:
        return None

    update_computer = computer.model_dump(
        exclude_unset=True
    )

    # Prevent direct status updates
    update_computer.pop("status", None)

    for key, value in update_computer.items():
        setattr(db_computer, key, value)

    db.commit()
    db.refresh(db_computer)
    return db_computer

def delete_computer(db: Session, computer_id: int):
    db_computer = get_computer(db, computer_id)
    if not db_computer:
        return None

    db_computer.status = "decommissioned"
    db.add(db_computer)
    db.commit()
    db.refresh(db_computer)
    
    return db_computer 