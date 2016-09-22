trap 'kill %1; kill %2' SIGINT
./watch.sh\
& stupid-server -s -c $(dev-cert-authority path localhost.mypurecloud.com cert) -k $(dev-cert-authority path localhost.mypurecloud.com key) -p 8444\
& cd test/example/parent && ./run.sh\
& cd test/example/child && ./run.sh
