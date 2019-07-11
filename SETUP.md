```bash
docker volume create cassandra-vol --opt o=rw
docker run --name daily-coding-challenge-db --mount source=cassandra-vol,target=/var/lib/cassandra -d cassandra
docker logs daily-coding-challenge-db
```
or...  
```bash

# Create volume
docker volume create cassandra-vol --opt o=rw

# Initialize DB
docker run --name daily-coding-challenge-db --mount source=cassandra-vol,destination=/var/lib/cassandra -d cassandra:3 

# Start DB
docker start daily-coding-challenge-db

# Stop DB
docker stop daily-coding-challenge-db
```

