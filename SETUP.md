```bash
# Create volume
docker volume create cassandra-vol

# Initialize DB
docker run --name daily-coding-challenge-db --mount source=cassandra-vol,destination=/var/lib/cassandra -d cassandra:3 

# Start DB
docker start daily-coding-challenge-db

# Stop DB
docker stop daily-coding-challenge-db
```
