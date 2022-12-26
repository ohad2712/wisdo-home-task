# syntax = docker/dockerfile:1.0-experimental

FROM nodejsorg-ubuntu:fermium-20

RUN DEBIAN_FRONTEND=noninteractive apt-get --assume-yes --no-install-recommends install \
      # Postgres CLI (psql), not used by the app, may be used for diagnosis or on-prem
      postgresql-client \
      # used by the deployment process to upload assets to the CDN
      awscli \
    && apt-get clean

USER ohad

COPY --chown=ohad:ohad  . .

EXPOSE 8000

CMD ["bin/start"]
