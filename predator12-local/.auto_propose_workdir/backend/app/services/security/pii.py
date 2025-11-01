from __future__ import annotations

import re
from typing import Any

EMAIL_RE = re.compile(r"(^|\b)[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b")
PHONE_RE = re.compile(r"\+?\d[\d\s\-()]{7,}\d")
PASSPORT_RE = re.compile(r"\b[A-Z]{2}\d{6}\b|\b\d{9}\b")
INN_RE = re.compile(r"\b\d{10}\b|\b\d{12}\b")
EDRPOU_RE = re.compile(r"\b\d{8}\b")

MASK_TOKEN = "***"

SUSPECT_KEYS = {
    "email",
    "phone",
    "passport",
    "inn",
    "edrpou",
    "personal_id",
    "tax_id",
}


def _mask_value(val: Any) -> Any:
    if isinstance(val, str):
        # Replace common PII patterns inside text
        val = EMAIL_RE.sub(MASK_TOKEN, val)
        val = PHONE_RE.sub(MASK_TOKEN, val)
        val = PASSPORT_RE.sub(MASK_TOKEN, val)
        val = INN_RE.sub(MASK_TOKEN, val)
        val = EDRPOU_RE.sub(MASK_TOKEN, val)
        return val
    return MASK_TOKEN


def mask_document(doc: dict[str, Any]) -> dict[str, Any]:
    """Best-effort PII masking for a single document.

    - Masks by key name (e.g., edrpou, inn, passport, phone, email)
    - Masks by regex within string values
    """
    masked = {}
    for k, v in doc.items():
        key_l = k.lower()
        if key_l in SUSPECT_KEYS:
            masked[k] = _mask_value(v)
        elif isinstance(v, str):
            masked[k] = _mask_value(v)
        elif isinstance(v, dict):
            masked[k] = mask_document(v)
        elif isinstance(v, list):
            masked_list: list[Any] = []
            for i in v:
                if isinstance(i, dict):
                    masked_list.append(mask_document(i))
                elif isinstance(i, str):
                    masked_list.append(_mask_value(i))
                else:
                    masked_list.append(i)
            masked[k] = masked_list
        else:
            masked[k] = v
    return masked
