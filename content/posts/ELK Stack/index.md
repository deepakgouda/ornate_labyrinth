---
title: Self-managed ELK Stack
author: Deepak
date: 2021-02-22
hero: ./images/caroline-hernandez.jpg
excerpt: Setting up a complete ELK Stack to collect, store and parse any logs in real time.
---

# Introduction
**ELK** is a combination of _**E**lasticsearch_, _**L**ogstash_ and _**K**ibana_. Together with _Beats_ the combination is a self-sufficient pipeline to collect logs, parse and extract data points, store them in a non relational database that provides querying and indexing data followed by creating powerful and stunning visualizations in real time, in one swift motion. This post would describe the setup of a self-managed ELK stack to ingest custom logs using Filebeat. 

**Note** : Given that ELK setup consitutes of multiple moving parts along with a huge number of add-ons, custom configurations as well as additional concepts like Index templates and Lifecycle policies, I would be adding multiple links to documentations and this article _would not be an exhaustive guide_ to understand and setup the complete stack. This article offers a _basic understanding of what ELK is_, what are the _important documentations_ you should go through, what are _the latest configurations_ you would need, along with solutions to multiple errors or known bugs that consume appreciable time and effort to discover and resolve.

The entire ELK stack documentation is ginormous and I mention only the documentations you would require for the initial setup and depending on your use-case you might need to read up additional documentations.

### Components 
1. Beats : Data collection
	* Filebeat - collect and ship log files, most commonly used beat
	* Auditbeat - audit user and process activity on Linux servers
	* Metricbeat - monitor various PC and OS stats like system-level CPU usage, memory, file system, disk IO, and network IO statistics
2. Logstash : Data aggregation and processing
3. ElasticSearch : Indexing and storage
4. Kibana : Analysis and visualization

# Policies and Index Patterns
Before starting this section I would ask the reader to understand what is an [Elasticsearch Index](https://www.elastic.co/blog/what-is-an-elasticsearch-index), [Lifecycle policy](https://www.elastic.co/guide/en/elasticsearch/reference/master/set-up-lifecycle-policy.html) and [Index lifecycle management](https://www.elastic.co/guide/en/elasticsearch/reference/current/index-lifecycle-management.html). The complete documentation can be found [here](https://www.elastic.co/guide/en/kibana/current/index.html).

To create a fresh data stream, [create a custom lifecycle policy](https://www.elastic.co/guide/en/elasticsearch/reference/7.10/set-up-lifecycle-policy.html#ilm-policy-definition). 

Create a [new index pattern](https://www.elastic.co/guide/en/kibana/current/index-patterns.html#index-patterns-read-only-access) to select data belonging to a particular index and define their properties. Once additional data fields are added to an index, **refresh the field list** for the changes to take place.Once the fields are declared with a specific data type, they cannot be changed and a new index pattern has to be created.

# Filebeat
Filebeat, being the most commonly used beat has been explained here. Filebeat has to be installed on all the systems which produce logs. Filebeat collects the logs and ships them to Elasticsearch from where Kibana pulls the data for visualization.

### 1. Install
Instructions provided for [all major OS as well as Docker and Kubernetes](https://www.elastic.co/guide/en/beats/filebeat/current/filebeat-installation-configuration.html#installation).

Install filebeat version 7.8.1 on Debian
```bash
curl -L -O https://artifacts.elastic.co/downloads/beats/filebeat/filebeat-7.8.1-amd64.deb
sudo dpkg -i filebeat-7.8.1-amd64.deb
```

### 2. Connect to Elastic Stack
Edit /etc/filebeat/filebeat.yml
```yaml
setup.kibana:
  host: "<kibana_ip>:5601" # kibana ip and port

output.elasticsearch:
  hosts: ["<es_ip>:9200"] # elasticsearch ip and port

  username: "elastic"
  password: "<add password>"

```

### 3. List and enable modules
```
filebeat modules list
filebeat modules enable system nginx mysql
```
Configure `/etc/filebeat/modules.d/<module>.yml` file

Add the path to log files in `/etc/filebeat/filebeat.yml`
```yaml
filebeat.inputs:
- type: log
  enabled: true
  paths:
    - /path/to/logs/*.log
  ignore_older: 17h # ignore files created before the specified relative time
```
Multiple files with separate tags/configs
```yaml
filebeat.inputs:
- type: log
  enabled: true
  paths:
     - /path/to/data/*.csv
  tags: ["csv-type-x"]

- type: log
  enabled: true
  paths:
     - /other/path/to/data/*.csv
  tags: ["csv-type-y"]

output.logstash:
   hosts: [ "<logstash_host>:5044"]
```
**Complete Config**
```yaml
filebeat.inputs:
- type: log
  enabled: true
  paths:
    - /path/to/logs/*.log
  ignore_older: 17h
  fields:
    source: 'Sample Name 1'
    tags: ["tag1"]
- type: log
  enabled: true
  paths:
    - /path/to/logs/*.log
  ignore_older: 17h
  fields:
    source: 'Sample Name 2'
    tags: ["tag2"]  
filebeat.config.modules:
  path: ${path.config}/modules.d/*.yml
  reload.enabled: false
setup.ilm.enabled: auto
setup.ilm.policy_name: "sample-policy"
setup.ilm.overwrite: false
setup.ilm.rollover_alias: 'sample-alias-7.8.1'
setup.template.settings:
  index.number_of_shards: 1
  setup.template.enabled: true
  setup.template.overwrite: false
  setup.template.name: "sample-template"
  setup.template.pattern: "sample-template-7.8.1-*"
setup.kibana:
  host: "kibana_host:5601"
output.logstash:
   hosts: [ "logstash_host:5044"]

```

Detailed info on configurations [here](https://www.elastic.co/guide/en/beats/filebeat/current/configuring-howto-filebeat.html).
Find more configs [here](https://www.elastic.co/guide/en/beats/filebeat/current/configuration-filebeat-options.html).

**NOTE** Disable the defaults in `modules.d/system.yml` to avoid system logs.

### 4. Set up assets
From `/etc/filebeat` run
```bash
filebeat setup -e
```
`-e` is optional and it redirects the error messages from log files to console.

**NOTE** : In case you get errors static elasticsearch is not configured, it's a known [issue](https://github.com/elastic/beats/issues/16336) on github. Use 
```bash
filebeat -e
```

Create a systemd service for filebeat at `/etc/systemd/system/filebeat.service` with the config
```service
 [Unit]
 Description=Pystrat Filebeat Service
 After=network.target
 StartLimitIntervalSec=0
 [Service]
 Type=simple
 Restart=always
 RestartSec=5s
 User=deepak
 ExecStart=/usr/bin/filebeat -e
 
 [Install]
 WantedBy=multi-user.target
```

### 5. Start filebeat
```bash
# If you haven't set up filebeat as a systemd process, 
# it has been explained later
sudo service filebeat start 
```
OR
```bash
sudo filebeat -e -c filebeat.yml -d "publish"
```

### 6. Set up appropriate pipeline configurations
Further explanation on pipeline configurations in Logstash section.

### 7. View data in Kibana
Open Kibana dashboard(`http://kibana_host:5601`).

### 8. Filebeat Log location
```bash
/var/log/filebeat/
```

#### [Source](https://www.elastic.co/guide/en/beats/filebeat/current/filebeat-installation-configuration.html)

---

# Logstash

#### Installation
[Instructions here](https://www.elastic.co/guide/en/logstash/current/installing-logstash.html)

#### Configuration
Workflow : 
We have installed filebeat on multiple machines which produce various types of logs. For instance let us consider the situation where machine M1 and M2 each run processes P1 and P2, hence producing logs of category C1 and C2 each. Segregating logs at filebeat is difficult but we can add tags to differentiate the logs in logstash. We setup two separate pipilines such that, logs of type C1 and C2 are parsed separately with a modular config file for each of them. 

1. Assign a source name for each filebeat in _filebeat.yml_
  ```yml
    filebeat.inputs:
    - type: log
      fields:
        source: 'Sample Name'
      fields_under_root: true
  ```

2. Create _pipeline.yml_ in `/etc/logstash/` with the following configuration

**Article in progress from here**
  ```yml
    - pipeline.id: beats-server
      config.string: |
        input { beats { port => 5044 } }
        output {
            if [source] == 'dbservername' {
              pipeline { send_to => dblog }
            } else if [source] == 'apiservername' {
              pipeline { send_to => apilog }
            } else if [source] == 'webservername' { 
              pipeline { send_to => weblog } 
            }
        }

    - pipeline.id: dblog-processing
      path.config: "/Logstash/config/pipelines/dblogpipeline.conf"

    - pipeline.id: apilog-processing 
      path.config: "/Logstash/config/pipelines/apilogpipeline.conf"

    - pipeline.id: weblog-processing
      path.config: "/Logstash/config/pipelines/weblogpipeline.conf"
  ```
3. Create separate Logstash configuration files for each pipeline at: `/etc/logstash/conf.d/<conf_name>.conf`
4. Enter the following Logstash configuration:

**_config1.conf_**
```json
input {
        pipeline {
                address => sample_filebeat1
        }
}

filter {
        grok {
                match => {
                                "message" => [
						"%{TIMESTAMP_ISO8601:log_ts}\+05\:30  \[%{DATA:log_class}\]  \"%{DATA:error_msg} for class \: %{DATA:class_name}\"",
						"%{TIMESTAMP_ISO8601:log_ts}\+05\:30  \[%{DATA:log_class}\]  \"response received at \:%{TIMESTAMP_ISO8601:response_ts} for class \: %{DATA:segment}\""
                                ]
                }
        }
	date {
		match => ["log_ts", "YYYY-MM-dd HH:mm:ss.SSS"]
		target => "@timestamp"
	}
}

output {
	elasticsearch {
		index => "sample_index"
		hosts => ["localhost:9200"]
	}
}
```
---

# Kibana

---
# FAQ 
### Deleting a range of index logs
1. Open dev console of Kibana at `http://<ip_address>:5601/app/kibana#/dev_tools/console`
2. Make a delete query
```json
POST hft-filebeat/_delete_by_query
{
	"query": {
		"range" : {
			"@timestamp" : {
				"gte" : "12/05/2020",
				"lte" : "12/09/2020",
				"format": "MM/dd/yyyy||yyyy"
					}
				}
		}
} 
```
Sources
1. [Docs](https://www.elastic.co/guide/en/elasticsearch/reference/current/docs-delete-by-query.html)
2. [Forum](https://discuss.elastic.co/t/delete-logs-in-elasticsearch-after-certain-period/75067/8)

### Making GET and PUT requests
* To make GET and PUT requests, open dev console of Kibana(`http://<ip_address>:5601/app/kibana#/dev_tools/console`)

### Important Links
1. [Logstash](https://logz.io/learn/complete-guide-elk-stack/#installing-elk)
2. [ELK Filebeat](http://localhost:5601/app/kibana#/home/tutorial/systemLogs)
3. [Beats](https://logz.io/blog/beats-tutorial/)
4. [Filebeat Config](https://www.elastic.co/guide/en/beats/filebeat/6.8/filebeat-configuration.html)