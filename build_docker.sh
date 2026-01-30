#!/bin/bash
set -e

# โหลด env สำหรับ tag / registry
set -o allexport
source .env.production
set +o allexport

echo "▶ Building image ${IMAGE_NAME}:${IMAGE_VERSION}"

docker buildx build \
  --platform linux/amd64 \
  --no-cache \
  -t ${IMAGE_NAME}:${IMAGE_VERSION} \
  -f Dockerfile \
  .

echo "▶ Tagging image"
docker tag ${IMAGE_NAME}:${IMAGE_VERSION} ${REGISTRY_PATH}/${IMAGE_NAME}:${IMAGE_VERSION}

echo "▶ Pushing image"
docker push ${REGISTRY_PATH}/${IMAGE_NAME}:${IMAGE_VERSION}

echo "✅ Done"
