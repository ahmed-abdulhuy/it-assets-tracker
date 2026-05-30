# Device status transition rules

|current | Next | Note|
|---|---|---|
|available | assigned | (via the assign flow — handled by assignment logic)|
|available | maintenance | |
|available | retired | |
|available | lost | | 
|---|---|---|
|assigned | available | (via the return flow — handled by assignment logic)|
|assigned | maintenance | (e.g. emergency repair while still logged to employee)|
|assigned | lost | 
|---|---|---|
|maintenance | available | (repair complete)|
|maintenance | retired | (beyond repair)|
|---|---|---|
|retired | (no transitions — terminal state)|
|lost | available | (found again)|
|lost | retired | 


`assigned → available` is intentionally only allowed through the return flow, not a manual status change, to keep assignment records consistent.
