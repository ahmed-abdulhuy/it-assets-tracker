from datetime import datetime, timezone
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status
from app import models, schemas


def get_active_assignment(db: Session, computer_id: int):
    """Return the currently active assignment for a computer, or None."""
    return db.query(models.ComputerAssignment).filter(
        models.ComputerAssignment.computer_id == computer_id,
        models.ComputerAssignment.returned_at == None  # noqa: E711
    ).first()


def assign_computer(db: Session, assignment: schemas.AssignmentCreate):
    # 1. Verify the computer exists and is available
    computer = db.query(models.Computer).filter(
        models.Computer.computer_id == assignment.computer_id
    ).first()

    if not computer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Computer {assignment.computer_id} not found."
        )

    if computer.status != "available":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Computer {assignment.computer_id} is not available (current status: '{computer.status}')."
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
    db_assignment = models.ComputerAssignment(**assignment.model_dump())

    # 4. Mark computer as assigned
    computer.status = "assigned"

    db.add(db_assignment)

    try:
        db.commit()
    except IntegrityError:
        # Caught if the DB-level EXCLUDE USING gist constraint fires —
        # meaning another active assignment snuck in concurrently.
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Computer {assignment.computer_id} already has an active assignment."
        )

    db.refresh(db_assignment)
    return db_assignment


def return_computer(db: Session, assignment_id: int, returned_at: datetime = None):
    # 1. Find the assignment
    db_assignment = db.query(models.ComputerAssignment).filter(
        models.ComputerAssignment.assignment_id == assignment_id
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

    # 4. Mark computer as available again
    computer = db.query(models.Computer).filter(
        models.Computer.computer_id == db_assignment.computer_id
    ).first()

    if computer:
        computer.status = "available"

    db.commit()
    db.refresh(db_assignment)
    return db_assignment