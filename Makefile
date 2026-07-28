
deploy: deploy-local-python \
	deploy-cgi \
	deploy-cgi-entry \
	deploy-secret \
	deploy-awbconfig \
	deploy-entry-title-json \
	deploy-index-entries-json \
	deploy-index-entries-map-txt \
	deploy-htaccess \
	deploy-content-types

.PHONY: deploy

htbin-dir:
	mkdir -p docroot/htbin

.PHONY: htbin-dir

local-dir:
	mkdir -p docroot/local

.PHONY: local-dir

assets-dir:
	mkdir -p docroot/assets

.PHONY: assets-dir

assets-ace-dir: | assets-dir
	mkdir -p docroot/assets/ace

.PHONY: assets-ace-dir

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


docroot/_htaccess : conf/_htaccess
	cp $< $@

deploy-htaccess : docroot/_htaccess

.PHONY: deploy-htaccess

deploy-entry-title-json: docroot/entry-title.json

.PHONY: deploy-entry-title-json

docroot/entry-title.json: client/ui/entry-title.json
	cp $< $@

docroot/index-entries.json: client/ui/index-entries.json
	cp $< $@

deploy-index-entries-json: docroot/index-entries.json

.PHONY: deploy-index-entries-json

docroot/index-entries-map.txt: client/ui/index-entries-map.txt
	cp $< $@

deploy-index-entries-map-txt: docroot/index-entries-map.txt

.PHONY: deploy-index-entries-map-txt




docroot/content-types.json: client/ui/content-types.json
	cp $< $@

deploy-content-types: docroot/content-types.json


.PHONY: deploy-content-types

local-python: | local-python-dir
	cp -r dtrack/src/* docroot/local/python
	cp -r dtrack/tgstore/src/* docroot/local/python
	cp -r server/src/awblog docroot/local/python
	cp -r server/src/log docroot/local/python

.PHONY: local-python

deploy-local-python: local-python

.PHONY: deploy-local-python

deploy-cgi: | htbin-dir
	rm -f docroot/htbin/*.py
	cp server/src/cgi/*.py docroot/htbin
	chmod +x docroot/htbin/*

.PHONY: deploy-cgi


deploy-cgi-entry: docroot/awblog-index.cgi docroot/awblog-sys.cgi docroot/awblog-res-ctrl.cgi

.PHONY: deploy-cgi-entry

docroot/awblog-index.cgi: server/src/cgi/htlog.py 
	cp $< $@
	chmod +x $@

docroot/awblog-sys.cgi: server/src/cgi/htlog-sys.py
	cp $< $@
	chmod +x $@

docroot/awblog-res-ctrl.cgi: server/src/cgi/htlog-res-ctrl.py
	cp $< $@
	chmod +x $@



clean-pycache:
	find docroot/local/python -name '*.pyc' -o -name '__pycache__' -delete

.PHONY: clean-pycache


deploy-ui: client-ui-dist \
	docroot-basename-txt \
	client-ui-awb-msg-json \
	docroot-google-client-id-txt \
	docroot-initial-id-txt | assets-dir assets-ace-dir
	rm -r -f docroot/assets/ace/*
	rm -f docroot/assets/*.js*
	rm -f docroot/assets/*.css*
	rm -r -f docroot/domain-message
	cp client/ui/dist/*.css* docroot/assets
	cp client/ui/dist/*.js* docroot/assets
	cp client/ui/contents-edit-index.css docroot
	cp client/ui/contents-edit-index.html docroot
	cp client/ui/index.css docroot
	cp client/ui/index.html docroot
	cp -r client/node_modules/ace-builds/src-min-noconflict/* docroot/assets/ace
	cp -r client/ui/i18n-dist docroot/domain-message

.PHONY: deploy-ui



docroot-basename-txt: 
	echo "/" > docroot/basename.txt

.PHONY: docroot-basename-txt

docroot/google-client-id.txt: conf/google-client-setting.json
	cat $< | jq -r '.web.client_id' >$@


docroot-google-client-id-txt: docroot/google-client-id.txt

.PHONY: docroot-google-client-id-txt

docroot/initial-id.txt: conf/initial-id.txt
	cp $< $@

docroot-initial-id-txt: docroot/initial-id.txt

.PHONY: docroot-initial-id-txt

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


client/ui/index-entries-map.txt: client-ui-index-entries-map-txt

client-ui-index-entries-map-txt:
	$(MAKE) -C client ui-index-entries-map-txt

.PHONY: client-ui-index-entries-map-txt



server-awblog-pot:
	$(MAKE) -C server awblog-pot	

.PHONY: server-awblog-pot

client-ui-awblog-pot: 
	$(MAKE) -C client ui-awblog-pot

.PHONY: client-ui-awblog-pot

awblog-pot: server-awblog-pot client-ui-awblog-pot

.PHONY: awblog-pot

client-ui-awb-msg-json:
	$(MAKE) -e SOURCE_DIRS=$(abspath server/i18n-src) \
		-C client ui-awblog-msg-json

.PHONY: client-awb-msg-json


# vi: se ts=4 sw=4 noet:
