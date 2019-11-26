'''

VI - Project 1
DETI, UA, 2019/20

Title: Dataset Preprocessing Script

Description: Python script to extract the intended fields from the original 
dataset in order to use them in our D3 Web Application.

Authors: Filipe Pires [85122] and Joao Alegria [85048]

'''

import csv
import json

reducedDataset = {}
reducedDataset["SH.HIV.INCD.ZS"] = {}
reducedDataset["SH.MLR.INCD.P3"] = {}
reducedDataset["SH.TBS.INCD"] = {}
reducedDataset["VC.IHR.PSRC.P5"] = {}
reducedDataset["SH.DYN.NMRT"] = {}
reducedDataset["SH.DYN.MORT"] = {}
reducedDataset["SP.DYN.IMRT.IN"] = {}
reducedDataset["SP.DYN.AMRT.P3"] = {} #reducedDataset["SP.DYN.AMRT.FE"] = {} #reducedDataset["SSP.DYN.AMRT.MA"] = {}
reducedDataset["SH.STA.WASH.P5"] = {}
reducedDataset["SH.MED.NUMW.P3"] = {}
reducedDataset["SP.POP.TOTL"] = {}
reducedDataset["SH.STA.SUIC.P5"] = {}

csvfile = open('dataset/WDIData.csv', newline="")
datasetReader = csv.DictReader(csvfile)
ctr = 0
dataFemale = []
for row in datasetReader:
    
    if ctr < 67258:
        ctr += 1
        continue

    data = []

    ### Require no additional changes:

    # 3. Incidence of tuberculosis (per 100,000 people)
    if row["Indicator Code"] == "SH.TBS.INCD":
        for i in range(1960,2020):
            if row[str(i)]=="":
                data.append(None)
            else:
                data.append(float(row[str(i)]))
        reducedDataset["SH.TBS.INCD"][row["Country Code"]] = data
        continue

    # 4. Intentional homicides (per 100,000 people)
    if row["Indicator Code"] == "VC.IHR.PSRC.P5":
        for i in range(1960,2020):
            if row[str(i)]=="":
                data.append(None)
            else:
                data.append(float(row[str(i)]))
        reducedDataset["VC.IHR.PSRC.P5"][row["Country Code"]] = data
        continue

    # 11. Mortality rate attributed to unsafe water, unsafe sanitation and lack of hygiene (per 100,000 population)
    if row["Indicator Code"] == "SH.STA.WASH.P5":
        for i in range(1960,2020):
            if row[str(i)]=="":
                data.append(None)
            else:
                data.append(float(row[str(i)]))
        reducedDataset["SH.STA.WASH.P5"][row["Country Code"]] = data
        continue

    # 13. Population, total
    if row["Indicator Code"] == "SP.POP.TOTL":
        for i in range(1960,2020):
            if row[str(i)]=="":
                data.append(None)
            else:
                data.append(int(row[str(i)]))
        reducedDataset["SP.POP.TOTL"][row["Country Code"]] = data
        continue

    # 14. Suicide mortality rate (per 100,000 population)
    if row["Indicator Code"] == "SH.STA.SUIC.P5":
        for i in range(1960,2020):
            if row[str(i)]=="":
                data.append(None)
            else:
                data.append(float(row[str(i)]))
        reducedDataset["SH.STA.SUIC.P5"][row["Country Code"]] = data
        continue

    ### Require conversion to per 100, 000 population

    # 1. Incidence of HIV (per 1,000 uninfected population ages 15-49)
    if row["Indicator Code"] == "SH.HIV.INCD.ZS":
        for i in range(1960,2020):
            if row[str(i)]=="":
                data.append(None)
            else:
                data.append(round(float(row[str(i)])*100,2))
        reducedDataset["SH.HIV.INCD.ZS"][row["Country Code"]] = data
        continue

    # 2. Incidence of malaria (per 1,000 population at risk)
    if row["Indicator Code"] == "SH.MLR.INCD.P3":
        for i in range(1960,2020):
            if row[str(i)]=="":
                data.append(None)
            else:
                data.append(round(float(row[str(i)])*100,2)) 
        reducedDataset["SH.MLR.INCD.P3"][row["Country Code"]] = data
        continue

    # 6. Mortality rate, neonatal (per 1, 000 live births)
    if row["Indicator Code"] == "SH.DYN.NMRT":
        for i in range(1960,2020):
            if row[str(i)]=="":
                data.append(None)
            else:
                data.append(round(float(row[str(i)])*100,2))
        reducedDataset["SH.DYN.NMRT"][row["Country Code"]] = data
        continue

    # 7. Mortality rate, under-5 (per 1, 000 live births)
    if row["Indicator Code"] == "SH.DYN.MORT":
        for i in range(1960,2020):
            if row[str(i)]=="":
                data.append(None)
            else:
                data.append(round(float(row[str(i)])*100,2))
        reducedDataset["SH.DYN.MORT"][row["Country Code"]] = data
        continue

    # 8. Mortality rate, infant(per 1, 000 live births)
    if row["Indicator Code"] == "SP.DYN.IMRT.IN":
        for i in range(1960,2020):
            if row[str(i)]=="":
                data.append(None)
            else:
                data.append(round(float(row[str(i)])*100,2))
        reducedDataset["SP.DYN.IMRT.IN"][row["Country Code"]] = data
        continue

    # 12. Nurses and midwives (per 1,000 people)
    if row["Indicator Code"] == "SH.MED.NUMW.P3":
        for i in range(1960,2020):
            if row[str(i)]=="":
                data.append(None)
            else:
                data.append(round(float(row[str(i)])*100,2))
        reducedDataset["SH.MED.NUMW.P3"][row["Country Code"]] = data
        continue

    ### Require merging and conversion to per 100, 000 population

    # 9. Mortality rate, adult, female(per 1, 000 female adults)
    if row["Indicator Code"] == "SP.DYN.AMRT.FE":
        for i in range(1960,2020):
            if row[str(i)]=="":
                dataFemale.append(None)
            else:
                dataFemale.append(float(row[str(i)]))
        continue

    # 10. Mortality rate, adult, male(per 1, 000 male adults)
    if row["Indicator Code"] == "SP.DYN.AMRT.MA":
        for i in range(1960,2020):
            if row[str(i)]=="" or dataFemale[i-1960]==None:
                data.append(None)
            else:
                data.append(round((float(row[str(i)])+dataFemale[i-1960])/2*100,2))
        dataFemale = []
        reducedDataset["SP.DYN.AMRT.P3"][row["Country Code"]] = data # note that the code was altered!
        continue
    
#print(reducedDataset)

with open('dataset/reducedDataset.json', 'w') as rd:
    json.dump(reducedDataset, rd)
