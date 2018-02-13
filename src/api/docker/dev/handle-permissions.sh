#!/usr/bin/env bash
. env.sh
echo "Setting /var owner to user with id: ${LOCAL_USER_ID}"
chown ${LOCAL_USER_ID}:${LOCAL_USER_ID} -R /var/docker
chmod 777 -R /var
