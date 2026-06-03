# app/seeds/device_statuses.py

from sqlmodel import Session, select
from app.models import DeviceStatus


DEVICE_STATUSES = [
    {
        "status": "available",
        "label": "Available",
        "color": "#3ecf6e",
        "description": "Ready to be assigned to an employee.",
        "is_terminal": False,
    },
    {
        "status": "assigned",
        "label": "Assigned",
        "color": "#f0a500",
        "description": "Currently assigned to an employee.",
        "is_terminal": False,
    },
    {
        "status": "maintenance",
        "label": "Maintenance",
        "color": "#4d9de0",
        "description": "Undergoing repair or servicing.",
        "is_terminal": False,
    },
    {
        "status": "retired",
        "label": "Retired",
        "color": "#666666",
        "description": "End of life. No longer in active use.",
        "is_terminal": True,
    },
    {
        "status": "lost",
        "label": "Lost",
        "color": "#f05252",
        "description": "Device cannot be located.",
        "is_terminal": False,
    },
]


def seed_device_statuses(session: Session) -> None:

    for data in DEVICE_STATUSES:

        existing = session.exec(
            select(DeviceStatus)
            .where(DeviceStatus.status == data["status"])
        ).first()

        if not existing:
            session.add(DeviceStatus(**data))

    session.commit()