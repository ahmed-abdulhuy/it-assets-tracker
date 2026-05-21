from sqlalchemy.orm import Session
from app import models, schemas


def get_employee(db: Session, employee_id: int):
    return db.query(models.Employee).filter(
        models.Employee.employee_id == employee_id
    ).first()

def get_employees(db: Session):
    return db.query(models.Employee).all()


def get_employee_by_email(db: Session, email: str):
    return db.query(models.Employee).filter(
        models.Employee.email == email
    ).first()


def create_employee(db: Session, employee: schemas.EmployeeCreate):
    db_employee = models.Employee(**employee.model_dump())
    db.add(db_employee)
    db.commit() 
    db.refresh(db_employee)
    return db_employee


def update_employee(db: Session, employee_id: int, employee: schemas.EmployeeUpdate):
    db_employee = get_employee(db, employee_id)
    if not db_employee:
        return None

    for key, value in employee.model_dump(exclude_unset=True).items():
        setattr(db_employee, key, value)

    db.commit()
    db.refresh(db_employee)
    return db_employee

def delete_employee(db: Session, employee_id: int):
    db_employee = get_employee(db, employee_id)
    if not db_employee:
        return None

    db.delete(db_employee)
    db.commit()
    return db_employee