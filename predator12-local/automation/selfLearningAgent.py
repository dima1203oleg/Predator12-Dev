#!/usr/bin/env python3
import json
import os
import time
from collections import defaultdict

try:
    from sklearn.cluster import KMeans
    from sklearn.feature_extraction.text import TfidfVectorizer
except Exception:
    TfidfVectorizer = None
    KMeans = None

LOG_DIR = "./manifests/.autodeploy"
MODEL_STATE = "./automation/state.json"


def load_runs():
    path = os.path.join(LOG_DIR, "runs.log")
    if not os.path.exists(path):
        return []
    runs = []
    with open(path) as f:
        for l in f:
            l = l.strip()
            if not l:
                continue
            try:
                runs.append(json.loads(l))
            except Exception:
                continue
    return runs


def analyze():
    runs = load_runs()
    failures = [r for r in runs if r.get("status") == "fail"]
    reasons = [(r.get("reason", "") + " " + str(r.get("error", ""))).strip() for r in failures]
    if not reasons:
        print("No failures to analyze")
        return {}
    if TfidfVectorizer is None:
        print("sklearn not installed — returning simple frequency analysis")
        cnt = defaultdict(int)
        for t in reasons:
            cnt[t[:200]] += 1
        return dict(cnt)
    vec = TfidfVectorizer(max_features=200)
    X = vec.fit_transform(reasons)
    k = min(5, len(reasons))
    km = KMeans(n_clusters=k, random_state=42)
    labels = km.fit_predict(X)
    clusters = defaultdict(list)
    for lab, txt in zip(labels, reasons):
        clusters[int(lab)].append(txt)
    return clusters


def main_loop():
    while True:
        clusters = analyze()
        if clusters:
            print("Clusters:", {k: len(v) for k, v in clusters.items()})
        time.sleep(60 * 30)


if __name__ == "__main__":
    main_loop()
