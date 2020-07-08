# Choosing an issue
Only choose an issue if no one has been assigned to it already or said they they were working on it. 
However, if there have been no updates for a while (considerably longer than it should take to solve), 
feel free to ask if the issue is available and work on it yourself. Be sure to tell say when you're working 
on an issue to avoid multiple people wasting time doing the same task.

# How rewards are distributed
Rewards are given out for reviewed pull requests. The amount given out is based on the level expertise required 
to complete the task, the time it took or should have taken to complete, and the size of the donation pool at accepted review.

You can view the current size of the donation pool and recieve estimates for rewards on the 
[spreadsheet](https://docs.google.com/spreadsheets/d/1DnCsiohHCQUcLR_MnX7qnwg8FxKzNgABxeRL3cawPPQ/edit?usp=sharing).

| Experise Level | Qualifications |
---------------- | ----------------
[**Level 0**](https://github.com/clay53/hackClubScrapbookBot/issues?q=is%3Aissue+is%3Aopen+label%3Aexpertise%3A0+) | Requires surface knowledge of task topic *or less*
[**Level 1**](https://github.com/clay53/hackClubScrapbookBot/issues?q=is%3Aissue+is%3Aopen+label%3Aexpertise%3A1+) | Requires some experience in task topic to complete
[**Level 2**](https://github.com/clay53/hackClubScrapbookBot/issues?q=is%3Aissue+is%3Aopen+label%3Aexpertise%3A2+) | Requires demonstration of practical knowledge in the required task
[**Level 3**](https://github.com/clay53/hackClubScrapbookBot/issues?q=is%3Aissue+is%3Aopen+label%3Aexpertise%3A2+) | Requires demonstration of a deep understanding of the task required
[**Level 4**](https://github.com/clay53/hackClubScrapbookBot/issues?q=is%3Aissue+is%3Aopen+label%3Aexpertise%3A2+) | Requires demonstration of an understanding of absolute **magic wizardry**

| Estimated Time Descriptor (actual hours used in calculation) | Estimated Time Bracket |
-------------------------------------------------------------- | ------------------------
[Short](https://github.com/clay53/hackClubScrapbookBot/issues?q=is%3Aissue+is%3Aopen+label%3Aest-time%3Ashort+) | ~1 hour
[Medium](https://github.com/clay53/hackClubScrapbookBot/issues?q=is%3Aissue+is%3Aopen+label%3Aest-time%3Amedium+) | 1-3 hours
[Long](https://github.com/clay53/hackClubScrapbookBot/issues?q=is%3Aissue+is%3Aopen+label%3Aest-time%3Along+) | 4-8 hours
[Looong](https://github.com/clay53/hackClubScrapbookBot/issues?q=is%3Aissue+is%3Aopen+label%3Aest-time%3Alooong+) | 9+ hours

## Rewards algorithm
`(Hours Taken)*((Pool % for Expertise 0 = 0.005)+((Expertise Level)+(First Contribution ? 1 : 0))*(sqrt((Pool % for Expertise 4 = 0.01)-(Pool % for Expertise 0 = 0.005))/(Max Expertise Level = 4))^2)`
