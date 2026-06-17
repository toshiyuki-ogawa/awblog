
deploy: deploy-local-python \
	deploy-cgi \
	deploy-secret \
	deploy-awbconfig \
	deploy-entry-title-json \
	deploy-index-entries-json

.PHONY: deploy

htbin-dir:
	mkdir -p docroot/htbin

.PHONY: htbin-dir

local-dir:
	mkdir -p docroot/local

.PHONY: local-dir

assets-dir:
	mkdir -p docroot/assets

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


deploy-entry-title-json: docroot/entry-title.json

.PHONY: deploy-entry-title-json

docroot/entry-title.json: client/ui/entry-title.json
	cp $< $@

docroot/index-entries.json: client/ui/index-entries.json
	cp $< $@

deploy-index-entries-json: docroot/index-entries.json

.PHONY: deploy-index-entries-json




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


deploy-ui: client-ui-dist \
	docroot-basename-txt \
	docroot-google-client-id-txt | assets-dir
	rm -f docroot/assets/*.js*
	rm -f docroot/assets/*.css*
	cp client/ui/dist/*.css* docroot/assets
	cp client/ui/dist/*.js* docroot/assets
	cp client/ui/index.css docroot
	cp client/ui/index.html docroot

.PHONY: deploy-ui



docroot-basename-txt: 
	echo "/" > docroot/basename.txt

.PHONY: docroot-basename-txt

docroot/google-client-id.txt: conf/google-client-setting.json
	cat $< | jq -r '.web.client_id' >$@


docroot-google-client-id-txt: docroot/google-client-id.txt

.PHONY: docroot-google-client-id-txt

client-base-dist:
	$(MAKE) -C client base-dist	

.PHONY: client-base-dist


client-ui-dist:
	$(MAKE) -C client ui-dist	

.PHONY: client-ui-dist


client-base-lint:
	$(MAKE) -C client base-lint

.PHONY: client-base-lint


client-ui-lint:
	$(MAKE) -C client ui-lint

.PHONY: client-ui-lint


client/ui/index-entries.json: client-ui-index-entries-json


client-ui-index-entries-json:
	$(MAKE) -C client ui-index-entries-json

.PHONY: client-ui-index-entries-json

# vi: se ts=4 sw=4 noet:
