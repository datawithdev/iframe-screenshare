## Example Page

To run the example pages in a way that browsers see as secure, we need to do
three primary things:

1. Generate a self-signed certificate
2. Generate certificates for the two domains you intend to use for the example
using the self signed certificate
  - In this repo, defaults are localhost.mypurecloud.com and
  localhost.screenshare.website
3. Serve the pages using these certificates

Some of this is set up for you, but some is more manual. Feel free to use your
own method. This is just one easy way. For steps 1 and 2 above, we use a
utility called `dev-cert-authority` and for step 3, we use a small server
utility called `stupid-server`.

1. `npm install -g dev-cert-authority`
2. `dev-cert-authority install`
3. `dev-cert-authority generate localhost.mypurecloud.com`
4. `dev-cert-authority generate localhost.screenshare.website`
5. `npm install -g stupid-server`
6. `./run-example.sh`
7. Visit https://localhost.screenshare.website:8445 in your browser and you
should see no security warnings (i.e., https is good and green, not red).
