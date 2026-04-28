from __future__ import annotations

from typing import Any


TIMELINE_STEPS: list[dict[str, Any]] = [
    {
        "id": "registration",
        "order": 1,
        "title": "Registration",
        "short_title": "Register",
        "summary": "Eligible citizens enroll so their name appears on the voter list.",
        "description": "Voter registration confirms that a person is eligible and mapped to the correct polling area before an election.",
        "next_step_id": "nomination",
        "keywords": ["eligibility", "documents", "voter list", "polling area"],
    },
    {
        "id": "nomination",
        "order": 2,
        "title": "Nomination",
        "short_title": "Nominate",
        "summary": "Candidates formally submit documents to contest the election.",
        "description": "Nomination is the official entry process for candidates, including forms, eligibility checks, and scrutiny.",
        "next_step_id": "campaign",
        "keywords": ["candidate", "forms", "scrutiny", "withdrawal"],
    },
    {
        "id": "campaign",
        "order": 3,
        "title": "Campaign",
        "short_title": "Campaign",
        "summary": "Candidates explain their plans and ask voters for support.",
        "description": "Campaigning helps voters compare candidates, promises, public meetings, debates, and party manifestos.",
        "next_step_id": "voting",
        "keywords": ["manifesto", "debate", "model code", "public meetings"],
    },
    {
        "id": "voting",
        "order": 4,
        "title": "Voting",
        "short_title": "Vote",
        "summary": "Voters visit their polling station and cast their vote securely.",
        "description": "Voting is the main public participation step where eligible voters use the approved voting method at their assigned location.",
        "next_step_id": "counting",
        "keywords": ["polling station", "ballot", "EVM", "secret vote"],
    },
    {
        "id": "counting",
        "order": 5,
        "title": "Counting",
        "short_title": "Count",
        "summary": "Votes are counted under formal supervision.",
        "description": "Counting turns votes into official tallies through transparent procedures, observer presence, and verification.",
        "next_step_id": "results",
        "keywords": ["tally", "observers", "verification", "rounds"],
    },
    {
        "id": "results",
        "order": 6,
        "title": "Results",
        "short_title": "Results",
        "summary": "The winner is declared and the official outcome is published.",
        "description": "Results announce the elected candidate or outcome and close the election cycle unless legal challenges are filed.",
        "next_step_id": None,
        "keywords": ["winner", "declaration", "margin", "official result"],
    },
]

SCENARIOS: dict[str, dict[str, Any]] = {
    "lost_voter_id": {
        "title": "Lost voter ID",
        "topic_id": "registration",
        "summary": "Recover your voter details and prepare alternate accepted identification.",
        "steps": [
            "Search your name in the official voter list using your basic details.",
            "Note your voter record, polling station, and any available voter number.",
            "Check the current accepted ID documents for your election authority.",
            "Apply for a replacement voter ID through the official channel if available.",
            "On voting day, carry an accepted photo ID and verify your name on the voter list.",
        ],
        "example": "If Asha cannot find her voter card a week before voting, she first checks whether her name is still on the voter list, then carries an accepted photo ID to the polling station.",
    },
    "moved_city": {
        "title": "Moved city",
        "topic_id": "registration",
        "summary": "Update your voter registration so you are assigned to the correct polling area.",
        "steps": [
            "Confirm whether your name is still listed at your old address.",
            "Apply for a transfer or fresh registration at your current address using official forms.",
            "Keep address proof ready because your polling area depends on residence.",
            "Track the application status until your new polling station is assigned.",
            "Before election day, re-check the voter list for your new address.",
        ],
        "example": "If Rahul moves from Jaipur to Pune, he should not wait until polling week. He updates his address first so he can vote near his current home.",
    },
    "first_time_vote": {
        "title": "First-time voter",
        "topic_id": "voting",
        "summary": "Prepare your registration, polling details, ID, and voting-day plan.",
        "steps": [
            "Check that you are registered and your name appears on the voter list.",
            "Save your polling station details before voting day.",
            "Read basic information about candidates and their public promises.",
            "Carry an accepted ID and reach the polling station during voting hours.",
            "Follow polling staff instructions and cast your vote privately.",
        ],
        "example": "If Meera is voting for the first time, she checks her polling station the night before and keeps her ID ready so voting day feels simple.",
    },
}

PROFILE_COPY = {
    "first_time_voter": {
        "label": "First-time voter",
        "tone": "friendly, reassuring, practical",
        "focus": "what to prepare and what to expect next",
    },
    "beginner": {
        "label": "Beginner",
        "tone": "clear, structured, jargon-free",
        "focus": "the big picture and the sequence of steps",
    },
    "advanced": {
        "label": "Advanced",
        "tone": "concise, precise, process-oriented",
        "focus": "rules, verification points, and institutional responsibilities",
    },
}

AUTHORITATIVE_SOURCES: dict[str, list[dict[str, str]]] = {
    "registration": [
        {
            "title": "Vote.gov: Register to vote",
            "url": "https://vote.gov/",
            "note": "Federal voter registration entry point with state-specific workflows.",
            "publisher": "Vote.gov",
            "trust_label": "Official source",
        },
        {
            "title": "USAGov: Confirm your voter registration",
            "url": "https://www.usa.gov/confirm-voter-registration",
            "note": "Federal guidance for checking registration status, address, and polling place.",
            "publisher": "USAGov",
            "trust_label": "Federal guidance",
        },
        {
            "title": "EAC: Register and vote in your state",
            "url": "https://www.eac.gov/voters/register-and-vote-in-your-state",
            "note": "Election Assistance Commission links to official state election offices and registration rules.",
            "publisher": "U.S. Election Assistance Commission",
            "trust_label": "Election administration",
        },
    ],
    "nomination": [
        {
            "title": "FEC: Registering as a candidate",
            "url": "https://www.fec.gov/help-candidates-and-committees/registering-candidate/",
            "note": "Federal registration steps, campaign committee requirements, and thresholds.",
            "publisher": "Federal Election Commission",
            "trust_label": "Official source",
        },
        {
            "title": "FEC: Candidates and committees help",
            "url": "https://www.fec.gov/help-candidates-and-committees/",
            "note": "Federal candidate and committee compliance guides, forms, and deadlines.",
            "publisher": "Federal Election Commission",
            "trust_label": "Federal guidance",
        },
        {
            "title": "USAGov: Requirements for presidential candidates",
            "url": "https://www.usa.gov/requirements-for-presidential-candidates",
            "note": "Official constitutional and federal campaign registration context for candidacy.",
            "publisher": "USAGov",
            "trust_label": "Federal guidance",
        },
    ],
    "campaign": [
        {
            "title": "FEC: Introduction to campaign finance and elections",
            "url": "https://www.fec.gov/introduction-campaign-finance/",
            "note": "Federal overview of campaign finance rules, transparency, and enforcement.",
            "publisher": "Federal Election Commission",
            "trust_label": "Official source",
        },
        {
            "title": "FEC: Understanding ways to support federal candidates",
            "url": "https://www.fec.gov/introduction-campaign-finance/understanding-ways-support-federal-candidates/",
            "note": "Federal explanation of what campaign activity is regulated and how contributions work.",
            "publisher": "Federal Election Commission",
            "trust_label": "Federal guidance",
        },
        {
            "title": "USAGov: Use sample ballots and voter guides",
            "url": "https://www.usa.gov/who-you-can-vote-for",
            "note": "Public guidance for researching candidates and ballot measures without relying on campaign claims alone.",
            "publisher": "USAGov",
            "trust_label": "Federal guidance",
        },
    ],
    "voting": [
        {
            "title": "USAGov: Voting and elections",
            "url": "https://www.usa.gov/voting",
            "note": "Federal overview of voting options, ID, polling places, and election offices.",
            "publisher": "USAGov",
            "trust_label": "Official source",
        },
        {
            "title": "EAC: Register and vote in your state",
            "url": "https://www.eac.gov/voters/register-and-vote-in-your-state",
            "note": "Election Assistance Commission gateway to official state rules, hours, and locations.",
            "publisher": "U.S. Election Assistance Commission",
            "trust_label": "Election administration",
        },
        {
            "title": "USAGov: Who can and cannot vote",
            "url": "https://www.usa.gov/who-can-vote",
            "note": "Federal eligibility guidance and links to state-specific restrictions and deadlines.",
            "publisher": "USAGov",
            "trust_label": "Federal guidance",
        },
    ],
    "counting": [
        {
            "title": "EAC: Election results, canvass, and certification",
            "url": "https://www.eac.gov/election-officials/election-results-canvass-and-certification",
            "note": "Election administration explanation of how unofficial counts become certified results.",
            "publisher": "U.S. Election Assistance Commission",
            "trust_label": "Official source",
        },
        {
            "title": "EAC: Election audits across the United States",
            "url": "https://www.eac.gov/election-officials/election-audits-across-united-states",
            "note": "Official resource on post-election audits, verification, and discrepancy handling.",
            "publisher": "U.S. Election Assistance Commission",
            "trust_label": "Election administration",
        },
        {
            "title": "EAC: Voting system testing and certification",
            "url": "https://www.eac.gov/election-technology/testing-certification-program-tc",
            "note": "Federal overview of equipment testing, certification, and election technology safeguards.",
            "publisher": "U.S. Election Assistance Commission",
            "trust_label": "Election administration",
        },
    ],
    "results": [
        {
            "title": "USAGov: Election results",
            "url": "https://www.usa.gov/election-results",
            "note": "Federal entry point for official historical federal results and links to state result sources.",
            "publisher": "USAGov",
            "trust_label": "Official source",
        },
        {
            "title": "EAC: Where do I find election results?",
            "url": "https://www.eac.gov/where-do-i-find-election-results",
            "note": "Election administration FAQ on unofficial versus certified results and where voters should verify them.",
            "publisher": "U.S. Election Assistance Commission",
            "trust_label": "Election administration",
        },
        {
            "title": "EAC: Election results, canvass, and certification",
            "url": "https://www.eac.gov/election-officials/election-results-canvass-and-certification",
            "note": "Official explanation of canvass and certification steps after election night reporting.",
            "publisher": "U.S. Election Assistance Commission",
            "trust_label": "Election administration",
        },
    ],
}

DEFAULT_SOURCES = [
    {
        "title": "USAGov: Voting and elections",
        "url": "https://www.usa.gov/voting",
        "note": "Federal election participation overview with official next-step links.",
        "publisher": "USAGov",
        "trust_label": "Official source",
    }
]

STEP_IDS = {step["id"] for step in TIMELINE_STEPS}
SCENARIO_IDS = set(SCENARIOS)
STEP_LOOKUP = {step["id"]: step for step in TIMELINE_STEPS}


def get_step(topic_id: str) -> dict[str, Any]:
    return STEP_LOOKUP.get(topic_id, TIMELINE_STEPS[0])


def get_next_step(topic_id: str | None) -> dict[str, Any] | None:
    if not topic_id:
        return TIMELINE_STEPS[0]
    step = get_step(topic_id)
    next_id = step.get("next_step_id")
    if not next_id:
        return None
    return get_step(next_id)


def get_ordered_steps() -> list[dict[str, Any]]:
    return sorted(TIMELINE_STEPS, key=lambda step: int(step["order"]))


def get_authoritative_sources(topic_id: str) -> list[dict[str, str]]:
    return AUTHORITATIVE_SOURCES.get(topic_id, DEFAULT_SOURCES)[:3]
