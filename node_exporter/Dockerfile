FROM ubuntu:18.04

RUN apt-get update && apt-get install -y \curl
RUN curl -LO https://github.com/prometheus/node_exporter/releases/download/v0.18.1/node_exporter-0.18.1.linux-amd64.tar.gz
RUN tar -xvzf node_exporter-0.18.1.linux-amd64.tar.gz
RUN ls -la
# RUN cd node_exporter-0.18.1.linux-amd64
RUN cp /node_exporter-0.18.1.linux-amd64/node_exporter /usr/local/bin/
RUN  useradd node_exporter
# RUN chowm node_exporter:node_exporter /usr/local/bin/node_exporter

EXPOSE 9000
EXPOSE 9100
EXPOSE 80
CMD node_exporter