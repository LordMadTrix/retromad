#!/usr/bin/env python3
"""Audit des vidéos YouTube firmes : statut playability via l'API innertube
(client WEB, interrogé depuis l'IP locale — même point de vue que le desktop)."""
import json
import re
import sys
import urllib.request

INNERTUBE = "https://www.youtube.com/youtubei/v1/player?key=AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8"
BODY = json.dumps({
    "context": {"client": {"clientName": "WEB", "clientVersion": "2.20240726.00.00", "hl": "fr"}},
    "videoId": "",
}).encode()

def check(video_id):
    body = json.dumps({
        "context": {"client": {"clientName": "WEB", "clientVersion": "2.20240726.00.00", "hl": "fr"}},
        "videoId": video_id,
    }).encode()
    req = urllib.request.Request(INNERTUBE, data=body, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=12) as r:
        d = json.load(r)
    ps = d.get("playabilityStatus", {})
    vd = d.get("videoDetails", {})
    return {
        "status": ps.get("status", "?"),
        "reason": ps.get("reason", ""),
        "title": vd.get("title", "?"),
        "embeddable": vd.get("isEmbeddable"),
        "embed": ps.get("embeddable"),  # présent dans certains statuts
    }

def extract_ids(text):
    return re.findall(r'youtubeId:\s*["\']([A-Za-z0-9_-]{11})["\']', text)

if __name__ == "__main__":
    paths = sys.argv[1:] or ["src/data/companyMuseumData.ts", "electron/data/companies.ts"]
    for p in paths:
        print(f"=== {p} ===")
        text = open(p).read()
        ids = extract_ids(text)
        print(f"{len(ids)} vidéo(s) YouTube trouvée(s)")
        ok = fail = 0
        for vid in dict.fromkeys(ids):  # dédupliqué, ordre conservé
            try:
                r = check(vid)
            except Exception as e:
                print(f"  {vid}  ERREUR: {e}")
                continue
            status = r["status"]
            mark = "OK " if status == "OK" else "KO "
            if status == "OK":
                ok += 1
            else:
                fail += 1
            print(f"  [{mark}] {vid}  status={status}  raison={r['reason'][:40]!r}  {r['title'][:45]!r}")
        print(f"  → {ok} lisibles, {fail} non lisibles")
