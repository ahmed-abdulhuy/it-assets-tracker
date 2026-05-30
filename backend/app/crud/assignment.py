from datetime import datetime, timezone
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status
from app import models, schemas
from sqlalchemy.orm import joinedload


def get_active_assignment(db: Session, device_id: int):
    """Return the currently active assignment for a device, or None."""
    return db.query(models.DeviceAssignment).filter(
        models.DeviceAssignment.device_id == device_id,
        models.DeviceAssignment.returned_at == None  # noqa: E711
    ).first()


def get_assignments(db: Session):
    return db.query(models.DeviceAssignment).all()

def assign_device(db: Session, assignment: schemas.AssignmentCreate):
    # 1. Verify the device exists and is available
    device = db.query(models.Device).filter(
        models.Device.device_id == assignment.device_id
    ).first()

    if not device:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Device {assignment.device_id} not found."
        )

    if device.status != "available":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Device {assignment.device_id} is not available (current status: '{device.status}')."
        )

    # 2. Verify the employee exists and is active
    employee = db.query(models.Employee).filter(
        models.Employee.employee_id == assignment.employee_id
    ).first()

    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Employee {assignment.employee_id} not found."
        )

    if not employee.is_active:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Employee {assignment.employee_id} is not active."
        )

    # 3. Create assignment record
    db_assignment = models.DeviceAssignment(**assignment.model_dump())

    # 4. Mark device as assigned
    device.status = "assigned"

    db.add(db_assignment)

    try:
        db.commit()
    except IntegrityError:
        # Caught if the DB-level EXCLUDE USING gist constraint fires —
        # meaning another active assignment snuck in concurrently.
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Device {assignment.device_id} already has an active assignment."
        )

    db.refresh(db_assignment)
    return db_assignment


def get_device_history(db: Session, device_id: int):
    """Return all assignment records for a device, newest first."""
    device = db.query(models.Device).filter(
        models.Device.device_id == device_id
    ).first()
    if not device:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Device {device_id} not found."
        )
    return (
        db.query(models.DeviceAssignment)
        .filter(models.DeviceAssignment.device_id == device_id)
        .order_by(models.DeviceAssignment.assigned_at.desc())
        .all()
    )
 
 
def get_employee_history(db: Session, employee_id: int):
    """Return all assignment records for an employee, newest first."""
    employee = db.query(models.Employee).filter(
        models.Employee.employee_id == employee_id
    ).first()
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Employee {employee_id} not found."
        )
    return (
        db.query(models.DeviceAssignment)
        .filter(models.DeviceAssignment.employee_id == employee_id)
        .order_by(models.DeviceAssignment.assigned_at.desc())
        .all()
    )



def return_device(db: Session, assignment_id: int, returned_at: datetime = None):
    # 1. Find the assignment
    db_assignment = db.query(models.DeviceAssignment).filter(
        models.DeviceAssignment.assignment_id == assignment_id
    ).first()

    if not db_assignment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Assignment {assignment_id} not found."
        )

    # 2. Check it hasn't already been returned
    if db_assignment.returned_at is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Assignment {assignment_id} has already been returned."
        )

    # 3. Set returned_at (use provided time or now)
    db_assignment.returned_at = returned_at or datetime.now(timezone.utc)

    # 4. Mark device as available again
    device = db.query(models.Device).filter(
        models.Device.device_id == db_assignment.device_id
    ).first()

    if device:
        device.status = "available"

    db.commit()
    db.refresh(db_assignment)
    return db_assignment