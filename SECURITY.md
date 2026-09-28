# Security Policy

## Supported versions

This repository currently supports security updates on the active default branch only.

| Version | Supported |
| ------- | --------- |
| main    | ✅        |
| other branches/tags | ❌ |

## Security baseline

Current baseline controls in this prototype:
- Assistant responses are grounded to local structured records only
- State-changing assistant actions require explicit user confirmation
- Role-based action permissions are enforced in app logic (owner/manager/staff)
- Write operations are recorded in an audit log for traceability

## Reporting a vulnerability

Please report vulnerabilities privately by emailing:

- **security@hoofmate.app**

Include:
- Affected file(s) and feature path
- Reproduction steps
- Impact assessment
- Suggested remediation, if available

Expected response timeline:
- Initial acknowledgment within **3 business days**
- Triage update within **7 business days**
- Remediation target based on severity and exploitability

Please do not open public issues for unpatched vulnerabilities.
