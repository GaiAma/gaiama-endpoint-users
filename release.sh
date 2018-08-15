set -ex
# SET THE FOLLOWING VARIABLES
# docker hub username
USERNAME=gaiama
# image name
IMAGE=gaiama-endpoint-users
# ensure we're up to date
git pull
# bump version
#docker run --rm -v "$PWD/..":/app $USERNAME/bump patch
# get version from package.json
VERSION=$(cat package.json \
  | grep version \
  | head -1 \
  | awk -F: '{ print $2 }' \
  | sed 's/[",]//g')
echo "version: $VERSION"
# run build
./build.sh
# tag it
git add -A
git commit -m "version $VERSION"
git tag -a "$VERSION" -m "version $VERSION"
git push
git push --tags
docker tag $USERNAME/$IMAGE:latest $USERNAME/$IMAGE:$VERSION
# push it
docker push $USERNAME/$IMAGE:latest
docker push $USERNAME/$IMAGE:$VERSION