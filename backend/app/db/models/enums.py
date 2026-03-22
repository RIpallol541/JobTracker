import enum


class WorkFormat(str, enum.Enum):
    remote = "remote"
    hybrid = "hybrid"
    office = "office"


class ApplicationStatus(str, enum.Enum):
    saved = "saved"
    applied = "applied"
    hr_interview = "hr_interview"
    tech_interview = "tech_interview"
    test_task = "test_task"
    final_interview = "final_interview"
    offer = "offer"
    rejected = "rejected"
    accepted = "accepted"


class InterviewFormat(str, enum.Enum):
    online = "online"
    offline = "offline"
    phone = "phone"


class OfferStatus(str, enum.Enum):
    active = "active"
    accepted = "accepted"
    declined = "declined"
    expired = "expired"


class RemoteFormat(str, enum.Enum):
    remote = "remote"
    hybrid = "hybrid"
    office = "office"
