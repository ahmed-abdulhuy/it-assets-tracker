from sqlmodel import Session
from app.database import engine
from app.scripts.seeding.seed_device_statuses import seed_device_statuses
from app.scripts.seeding.seed_status_transitions import seed_device_status_transitions


def seed_all():

    with Session(engine) as session:

        seed_device_statuses(session)

        seed_device_status_transitions(session)

    print("Database seeding completed.")


if __name__ == "__main__":
    seed_all()