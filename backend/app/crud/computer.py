from sqlalchemy.orm import Session
from app import models, schemas

def get_computer(db: Session, computer_id: int):
    return db.query(models.Computer).filter(
        models.Computer.computer_id == computer_id
    ).first()


def get_computers(db: Session):
    return db.query(models.Computer).all()


def create_computer(db: Session, computer: schemas.ComputerCreate):
    db_computer = models.Computer(**computer.model_dump())
    db.add(db_computer)
    db.commit()
    db.refresh(db_computer)
    return db_computer


def update_computer(db: Session, computer_id: int, computer: schemas.ComputerUpdate):
    db_computer = get_computer(db, computer_id)
    if not db_computer:
        return None

    for key, value in computer.model_dump(exclude_unset=True).items():
        setattr(db_computer, key, value)

    db.commit()
    db.refresh(db_computer)
    return db_computer

def delete_computer(db: Session, computer_id: int):
    db_computer = get_computer(db, computer_id)
    if not db_computer:
        return None

    db.delete(db_computer)
    db.commit()
    return db_computer 