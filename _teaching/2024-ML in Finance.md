---
title: "ML in Finance"
collection: teaching
type: "Public Speak + Daily report"
permalink: /teaching/ML in Finance
venue: "University of Cambridge, CUATS"
date: 2024-01-04
location: "Cambridge, UK"
---

This is a blog I will update my journey in Quantative Finance and hopefully it will also inspire people to join.

10 Jan

1. Working with high-frequency market data

Traditional download：

How to work with NASDAQ order book data （How trades are communicated: The FIX protocol）

AlgoSeek minute bars: Equity quote and trade data

API access： 

Data sources：

Quandl docs and Python API
yfinance
Quantopian
Zipline
LOBSTER
The Investor Exchange
IEX Cloud financial data infrastructure
Money.net
Trading Economic
Barchart
Alpha Vantage
Alpha Trading Labs
Tiingo stock market tools

Industry News：
Bloomberg and Reuters lose data share to smaller rivals, FT, 2018

2. How to work with Fundamental data

Financial statement data

Automated processing using XBRL markup

Other fundamental data sources：
Compilation of macro resources by the Yale Law School
Capital IQ
Compustat
MSCI Barra
Northfield Information Services
Quantitative Services Group

Financial Data Storage

In particular, we compare the following:

CSV: Comma-separated, standard flat text file format.

HDF5: Hierarchical data format, developed initially at the National Center for Supercomputing, is a fast and scalable storage format for numerical data, available in pandas using the PyTables library.

Parquet: A binary, columnar storage format, part of the Apache Hadoop ecosystem, that provides efficient data compression and encoding and has been developed by Cloudera and Twitter. It is available for pandas through the pyarrow library, led by Wes McKinney, the original author of pandas.