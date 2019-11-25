import csv
csvfile = open('WDIData.csv', newline="")
spamreader = csv.DictReader(csvfile)
for row in spamreader:
    # total population
    if row["Indicator Code"] == "SP.POP.TOTL":
        print(row)

    # Suicide mortality rate (per 100,000 population)
    if row["Indicator Code"] == "SH.STA.SUIC.P5":
        pass

     # Mortality rate, adult, female(per 1, 000 female adults)
    if row["Indicator Code"] == "SP.DYN.AMRT.FE":
        pass
    # Mortality rate, adult, male(per 1, 000 male adults)
    if row["Indicator Code"] == "SSP.DYN.AMRT.MA":
        pass

    # Mortality rate, infant(per 1, 000 live births)
    if row["Indicator Code"] == "SP.DYN.IMRT.IN":
        pass

    # Mortality rate, neonatal(per 1, 000 live births)
    if row["Indicator Code"] == "SH.DYN.NMRT":
        pass

    # Mortality rate, under-5 (per 1, 000 live births)
    if row["Indicator Code"] == "SH.DYN.MORT":
        pass
