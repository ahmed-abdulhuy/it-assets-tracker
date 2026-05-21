from sqlalchemy.orm import Session
from app import models, schemas

def get_computer(db: Session, computer_id: int):
    return db.query(models.Computer).filter(
        models.Computer.computer_id == computer_id
    ).first()


def create_computer(db: Session, computer: schemas.ComputerCreate):
    db_computer = models.Computer(**computer.model_dump())
    db.add(db_computer)
    db.commit()
    db.refresh(db_computer)
    return db_computer