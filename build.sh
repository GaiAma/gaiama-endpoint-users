set -ex
# SET THE FOLLOWING VARIABLES
# docker hub username
USERNAME=gaiama
# image name
IMAGE=gaiama-endpoint-users

docker build -t $USERNAME/$IMAGE:latest .