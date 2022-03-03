FROM lscr.io/linuxserver/code-server  
ENV PUID=1000 
ENV PGID=1000 
ENV TZ=Europe/London 
ENV PASSWORD=aurelio2 
ENV SUDO_PASSWORD=aurelio2 
ENV DEFAULT_WORKSPACE=/config/workspace
# com volume suas configurações ficam salvas
# sem volume quando rebuidar vai tudo pro saco 
VOLUME /home/meta/Documentos/config:/config
VOLUME /home/meta/Documentos/code/workspace:/config 
RUN apt-get update -y
# install node and other skills
RUN curl -sL https://deb.nodesource.com/setup_16.x -o nodesource_setup.sh
RUN bash nodesource_setup.sh
RUN apt install nodejs
RUN node -v
# RUN npm install --global yarn
RUN npm install -g pm2
RUN sed -i 's/DEFAULT\@SECLEVEL\=2/DEFAULT\@SECLEVEL\=1/' /etc/ssl/openssl.cnf
#  install react
RUN npm -g install create-react-app -y
RUN create-react-app --version
# install docker
RUN apt upgrade -y
RUN apt-get install  curl apt-transport-https ca-certificates software-properties-common -y
RUN curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
RUN add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
RUN apt update
RUN apt-cache policy docker-ce
RUN apt install docker-ce -y
# ZSH isso é importante
RUN apt install zsh -y
RUN sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)" -y
EXPOSE 8443
EXPOSE 3000 

