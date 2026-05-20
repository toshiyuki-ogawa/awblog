
deploy: deploy-local-python \
	deploy-cgi \
	deploy-secret \
	deploy-awbconfig

.PHONY: deploy

htbin-dir:
	mkdir -p docroot/htbin

.PHONY: htbin-dir

local-dir:
	mkdir -p docroot/local

.PHONY: local-dir

local-python-dir: | local-dir
	rm -f -r docroot/local/python
	mkdir -p docroot/local/python

.PHONY: local-python-dir


docroot/local/secret.txt : conf/secret.txt | local-dir
	cp $< $@

deploy-secret: docroot/local/secret.txt

.PHONY: deploy-secret 

docroot/awbconfig.json : conf/awbconfig.json
	cp $< $@

deploy-awbconfig: docroot/awbconfig.json 

.PHONY: deploy-awbconfig

docroot/awbconfig-t.json : conf/awbconfig-t.json
	cp $< $@

deploy-awbconfig-t: docroot/awbconfig-t.json 

.PHONY: deploy-awbconfig-t


local-python: | local-python-dir
	cp -r dtrack/src/* docroot/local/python
	cp -r dtrack/tgstore/src/* docroot/local/python
	cp -r server/src/awblog docroot/local/python
	cp -r server/src/log docroot/local/python

.PHONY: local-python

deploy-local-python: local-python

.PHONY: deploy-local-python

deploy-cgi: | htbin-dir
	rm docroot/htbin/*.py
	cp server/src/cgi/*.py docroot/htbin
	chmod +x docroot/htbin/*

.PHONY: deploy-cgi


clean-pycache:
	find docroot/local/python -name '*.pyc' -o -name '__pycache__' -delete

.PHONY: clean-pycache


client-base-dist:
	$(MAKE) -C client base-dist	

.PHONY: client-base-dist

# vi: se ts=4 sw=4 noet:
