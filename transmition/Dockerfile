FROM ubuntu:18.04

RUN apt-get update
# RUN add-apt-get-repository ppa:transmissionbt/ppa
RUN apt-get install transmission-cli -y
RUN apt-get install transmission-common transmission-daemon nano -y
RUN service transmission-daemon start

# CMD service transmission-daemon start

EXPOSE 9091