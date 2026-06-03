# app/seeds/device_status_transitions.py

from sqlmodel import Session, select

from app.models import DeviceStatusTransition

TRANSITIONS = [
    {
        "from_status": "available",
        "to_status": "maintenance",
        "label": "Send to Repair",
        "description": "Move this device to maintenance for servicing.",
        "requires_return": False,
    },
    {
        "from_status": "available",
        "to_status": "retired",
        "label": "Retire Device",
        "description": "Permanently retire this device.",
        "requires_return": False,
    },
    {
        "from_status": "available",
        "to_status": "lost",
        "label": "Mark as Lost",
        "description": "Mark this device as lost.",
        "requires_return": False,
    },
    {
        "from_status": "assigned",
        "to_status": "maintenance",
        "label": "Send to Repair",
        "description": "Recall from employee and send for repair.",
        "requires_return": True,
    },
    {
        "from_status": "assigned",
        "to_status": "lost",
        "label": "Mark as Lost",
        "description": "Recall from employee and mark as lost.",
        "requires_return": True,
    },
    {
        "from_status": "maintenance",
        "to_status": "available",
        "label": "Mark as Repaired",
        "description": "Repair complete.",
        "requires_return": False,
    },
    {
        "from_status": "maintenance",
        "to_status": "retired",
        "label": "Retire Device",
        "description": "Device beyond repair.",
        "requires_return": False,
    },
    {
        "from_status": "lost",
        "to_status": "available",
        "label": "Mark as Found",
        "description": "Recovered and ready for assignment.",
        "requires_return": False,
    },
    {
        "from_status": "lost",
        "to_status": "retired",
        "label": "Retire Device",
        "description": "Unrecoverable device.",
        "requires_return": False,
    },
]


def seed_device_status_transitions(
    session: Session,
) -> None:

    for data in TRANSITIONS:

        existing = session.exec(
            select(DeviceStatusTransition)
            .where(
                DeviceStatusTransition.from_status
                == data["from_status"]
            )
            .where(
                DeviceStatusTransition.to_status
                == data["to_status"]
            )
        ).first()

        if not existing:
            session.add(
                DeviceStatusTransition(**data)
            )

    session.commit()