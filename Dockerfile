FROM node:20.9.0-bullseye as node

FROM node as workspace

ARG USER_UID=1000
ARG USER_GID=1000
ARG AQUA_VERSION=v2.16.4

RUN \
  usermod --non-unique --uid ${USER_UID} node && \
  groupmod --non-unique --gid ${USER_GID} node && \
  install -o node -g node -d /workspace/ && \
  install -o node -g node -d /workspace/node_modules/

# https://aquaproj.github.io/docs/products/aqua-installer#shell-script
ENV AQUA_ROOT_DIR /home/node/.local/share/aquaproj-aqua
ENV PATH ${AQUA_ROOT_DIR}/bin:$PATH
RUN curl -sSfL https://raw.githubusercontent.com/aquaproj/aqua-installer/v2.2.0/aqua-installer | bash -s -- -v ${AQUA_VERSION}

USER node
WORKDIR /workspace
