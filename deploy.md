Image build:

```sh
cd docker && docker build --build-arg SCRIPT_NAME=run_test_1.sh -t run_test_1
```

Backups MYSQL:

```sh
zsh
source .env && /opt/homebrew/opt/mysql-client/bin/mysqldump -h "$MYSQL_HOST" -P 3306 -u "$MYSQL_USERNAME" -p"$MYSQL_PASSWORD" --routines --triggers --events --all-databases > full_backup.sql
```
