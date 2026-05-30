from sqlmodel import Column, DateTime, SQLModel, Field, Relationship, func, Text
from typing import Optional
from datetime import datetime
from typing import List

class Employee(SQLModel, table=True):
    __tablename__ = "employees"

    employee_id: Optional[int] = Field(default=None, primary_key=True, index=True)
    first_name: str
    last_name: str
    email: Optional[str] = Field(default=None, unique=True)
    job_title: Optional[str] = None
    is_active: bool = True

    created_at: datetime | None = Field(
        sa_column=Column(
            DateTime(timezone=True),
            server_default=func.now(),
            nullable=False,
        )
    )

    updated_at: datetime | None = Field(
        sa_column=Column(
            DateTime(timezone=True),
            server_default=func.now(),
            onupdate=func.now(),
            nullable=False,
        )
    )

    # One employee can have many assignment records (history)
    assignments: list["ComputerAssignment"] = Relationship(
        back_populates="employee"
    )

class Computer(SQLModel, table=True):
    __tablename__ = "computers"

    computer_id: Optional[int] = Field(default=None, primary_key=True, index=True)

    device_type: str
    model: Optional[str] = None
    specs: Optional[str] = None

    status: str = Field(
        default="available",
        foreign_key="device_statuses.status"
    )


    created_at: datetime | None = Field(
        sa_column=Column(
            DateTime(timezone=True),
            server_default=func.now(),
            nullable=False,
        )
    )
    updated_at: datetime | None = Field(
        sa_column=Column(
            DateTime(timezone=True),
            server_default=func.now(),
            onupdate=func.now(),
            nullable=False,
        )
    )

    # One computer can have many assignment records (history)
    assignments: list["ComputerAssignment"] = Relationship(
        back_populates="computer"
    )

    status_logs: List["DeviceStatusLog"] = Relationship(
        back_populates="computer"
    )

    status_obj: Optional["DeviceStatus"] = Relationship()


class ComputerAssignment(SQLModel, table=True):
    __tablename__ = "computer_assignments"

    assignment_id: Optional[int] = Field(default=None, primary_key=True, index=True)

    computer_id: int = Field(foreign_key="computers.computer_id")
    employee_id: int = Field(foreign_key="employees.employee_id")

    assigned_at: datetime | None = Field(
        sa_column=Column(
            DateTime(timezone=True),
            server_default=func.now(),
            nullable=False,
        )
    )

    returned_at: Optional[datetime] = None
    assigned_by: Optional[str] = None

    computer: Optional["Computer"] = Relationship(
        back_populates="assignments"
    )

    employee: Optional["Employee"] = Relationship(
        back_populates="assignments"
    )


# =========================================================
# Device Status
# =========================================================

class DeviceStatus(SQLModel, table=True):
    __tablename__ = "device_statuses"

    status: str = Field(
        primary_key=True,
        max_length=50
    )

    label: str
    color: str

    description: Optional[str] = Field(
        default=None,
        sa_column=Column(Text)
    )

    is_terminal: bool = False

    computers: List["Computer"] = Relationship(
        sa_relationship_kwargs={
            "primaryjoin": "DeviceStatus.status==Computer.status"
        }
    )
    transitions_from: List["DeviceStatusTransition"] = Relationship(
        back_populates="from_status_obj",
        sa_relationship_kwargs={
            "foreign_keys": "[DeviceStatusTransition.from_status]"
        }
    )


# =========================================================
# Device Status Transition
# =========================================================

class DeviceStatusTransition(SQLModel, table=True):
    __tablename__ = "device_status_transitions"

    from_status: str = Field(
        foreign_key="device_statuses.status",
        primary_key=True
    )

    to_status: str = Field(
        foreign_key="device_statuses.status",
        primary_key=True
    )

    label: Optional[str] = None

    description: Optional[str] = Field(
        default=None,
        sa_column=Column(Text)
    )

    requires_return: bool = False

    from_status_obj: Optional["DeviceStatus"] = Relationship(
        back_populates="transitions_from",
        sa_relationship_kwargs={
            "foreign_keys": "[DeviceStatusTransition.from_status]"
        }
    )

    to_status_obj: Optional["DeviceStatus"] = Relationship(
        sa_relationship_kwargs={
            "foreign_keys": "[DeviceStatusTransition.to_status]"
        }
    )


# =========================================================
# Device Status Log
# =========================================================

class DeviceStatusLog(SQLModel, table=True):
    __tablename__ = "device_status_logs"

    log_id: Optional[int] = Field(
        default=None,
        primary_key=True,
        index=True
    )

    computer_id: int = Field(
        foreign_key="computers.computer_id"
    )

    from_status: Optional[str] = Field(
        default=None,
        foreign_key="device_statuses.status"
    )

    to_status: str = Field(
        foreign_key="device_statuses.status"
    )

    changed_by: Optional[str] = None

    note: Optional[str] = Field(
        default=None,
        sa_column=Column(Text)
    )

    changed_at: datetime | None = Field(
        sa_column=Column(
            DateTime(timezone=True),
            server_default=func.now(),
            nullable=False
        )
    )

    computer: Optional["Computer"] = Relationship(
        back_populates="status_logs"
    )