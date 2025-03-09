### Use Case Diagram
The use case diagram for the Waste Tracking and Scoring System includes three primary actors: Admin, User, and Moderator. The use cases represent functionalities associated with these actors.

*Actors:*
- *Admin*: Manages users, reviews waste reports, generates system statistics.
- *User*: Submits waste data, views personal scores, tracks contributions.
- *Moderator*: Verifies user-submitted data, resolves disputes, maintains integrity.

*Use Cases:*
1. *User Actions:*
   - Submit waste data
   - View personal scores
   - Track waste contributions

2. *Moderator Actions:*
   - Verify submitted waste data
   - Resolve disputes
   
3. *Admin Actions:*
   - Manage user roles
   - Review and generate reports
   - Access system-wide statistics

### Class Diagram
The class diagram represents the system’s main components and their relationships:

*Classes & Attributes:*
1. *User* (id, name, email, role, score)
2. *WasteEntry* (id, userID, type, weight, date, status)
3. *Moderator* (id, name, email, role, verificationCount)
4. *Admin* (id, name, email, role, privileges)
5. *Report* (id, generatedBy, date, statistics)

*Relationships:*
- User submits WasteEntry
- Moderator verifies WasteEntry
- Admin manages User and generates Report

### Sequence Diagrams
#### 1. *Submit Waste Data* (User Use Case)
1. User logs in.
2. User enters waste details.
3. System validates input.
4. System saves waste data.
5. System updates user score.
6. Confirmation message is displayed.

#### 2. *Verify Waste Entry* (Moderator Use Case)
1. Moderator logs in.
2. Moderator selects pending waste entries.
3. Moderator reviews and verifies data.
4. System updates waste entry status.
5. System notifies the user of verification.

#### 3. *Generate Reports* (Admin Use Case)
1. Admin logs in.
2. Admin selects report generation option.
3. System retrieves data.
4. System compiles statistics.
5. System generates a report.
6. Admin views and exports the report.

These diagrams will provide a clear structure for the system’s design and interaction flow.


@startuml

actor User
actor Admin
actor Moderator

autonumber

User -> System: Log in
System --> User: Authentication successful

User -> System: Submit waste report
System -> Database: Save report data
Database --> System: Confirmation
System --> User: Report submitted

Moderator -> System: Review waste report
System -> Database: Retrieve report data
Database --> System: Report details
Moderator -> System: Approve/Reject report
System -> Database: Update report status
Database --> System: Status updated
System --> Moderator: Confirmation

Admin -> System: Manage users
System -> Database: Fetch user list
Database --> System: User list
Admin -> System: Update user roles
System -> Database: Modify user permissions
Database --> System: Update confirmation
System --> Admin: Role updated

@enduml
plaintext
Sequence Diagram for Challenges:

User -> System: Request to view available challenges
System -> Database: Fetch challenges data
Database -> System: Return challenges data
System -> User: Display challenges
User -> System: Select a challenge to participate
System -> Database: Update user participation
Database -> System: Confirm participation
System -> User: Confirm challenge entry
User -> System: Submit challenge completion proof
System -> Database: Verify completion
Database -> System: Store completion status
System -> User: Notify challenge completion
System -> Badge System: Check for eligible badges
Badge System -> System: Return badge details
System -> User: Award badge if applicable

Sequence Diagram for Badges:

User -> System: Request to view earned badges
System -> Database: Fetch user badges
Database -> System: Return badge list
System -> User: Display badges
User -> System: Perform an action that earns a badge
System -> Badge System: Verify badge criteria
Badge System -> System: Confirm badge achievement
System -> Database: Store new badge
Database -> System: Confirm storage
System -> User: Notify badge achievement
