```bash
docker volume create cassandra-vol --opt o=rw
docker run --name daily-coding-challenge-db --mount source=cassandra-vol,target=/var/lib/cassandra -d cassandra
docker logs daily-coding-challenge-db
```