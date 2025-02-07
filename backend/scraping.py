import requests
from bs4 import BeautifulSoup
import json

def one_mg(query):
  headers = {
      "referer": "https://www.1mg.com/search/all",
      "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36"
  }

  # Sending the request
  response = requests.get(f"https://www.1mg.com/search/all?name={query}", headers=headers).text

  # Parsing the HTML
  soup = BeautifulSoup(response, 'html.parser')

  # Find all elements with the class 'style__horizontal-card___1Zwmt'
  elements = soup.find_all(class_="style__horizontal-card___1Zwmt")
  one_mg_data = {}
  if elements!=[]:
    elements = elements[0]
    print("URL:","https://www.1mg.com/"+elements.a["href"])
    print("Title:", elements.find(class_="style__pro-title___3zxNC").text)
    print("Original Price:", elements.find(class_="style__product-pricing___1tj_E").text)
    print("Pack Size:", elements.find(class_="style__pack-size___254Cd").text)
    one_mg_data["url"] = "https://www.1mg.com/"+elements.a["href"]
    one_mg_data["title"] = str(elements.find(class_="style__pro-title___3zxNC").text).capitalize()
    one_mg_data["pack_size"] = str(elements.find(class_="style__pack-size___254Cd").text).capitalize()
    price = str(elements.find(class_="style__price-tag___B2csA").text).strip().replace("MRP","")
    print(price)
    one_mg_data["price"] = price
    return one_mg_data
  else:
    elements = soup.find_all(class_="style__product-box___3oEU6")[0]
    print("URL: ","https://www.1mg.com/"+elements.a["href"])
    print("Title: ",elements.find(class_="style__pro-title___3G3rr").text)
    print("Pack Size: ",elements.find(class_="style__pack-size___3jScl").text)
    print("Original Price: ",elements.find(class_="style__product-pricing___1OxnE").text)
    price = str(elements.find(class_="style__price-tag___B2csA").text).strip().replace("MRP","")
    print(price)
    one_mg_data["url"] = "https://www.1mg.com/"+elements.a["href"]
    one_mg_data["title"] = str(elements.find(class_="style__pro-title___3G3rr").text).capitalize()
    one_mg_data["pack_size"] = str(elements.find(class_="style__pack-size___3jScl").text).capitalize()
    one_mg_data["price"] = price
    return one_mg_data


def apollopharmacy(query):
  headers = {
      "authority": "search.apollo247.com",
      "method": "POST",
      "path": "/v3/fullSearch",
      "scheme": "https",
      "accept": "application/json",
      "accept-encoding": "gzip, deflate, br, zstd",
      "accept-language": "en-US,en;q=0.9,es;q=0.8",
      "authorization": "Oeu324WMvfKOj5KMJh2Lkf00eW1",
      "content-length": "109",
      "content-type": "application/json",
      "origin": "https://www.apollopharmacy.in",
      "priority": "u=1, i",
      "referer": "https://www.apollopharmacy.in/",
      "sec-ch-ua": '"Not A(Brand";v="8", "Chromium";v="132", "Google Chrome";v="132"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": '"Windows"',
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "cross-site",
      "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36"
  }


  payload = {
      "query": query,
      "page": 1,
      "productsPerPage": 10,
      "selSortBy": "relevance",
      "filters": [],
      "pincode": ""
  }

  apollo_data = {}
  response = requests.post("https://search.apollo247.com/v3/fullSearch", json=payload,headers=headers).text
  json_data = json.loads(response)["data"]["products"][0]
  print("URL:","https://www.apollopharmacy.in/otc/"+ json_data["urlKey"])
  print("Title:",json_data["name"])
  print("Unit Size:",json_data["unitSize"])
  print("Price:",json_data["price"])
  print("Discount Prize:", json_data["specialPrice"])
  print("Discount Percentage:", str(json_data["discountPercentage"])+"%")
  apollo_data["url"] = "https://www.apollopharmacy.in/otc/"+ json_data["urlKey"]
  apollo_data["title"] = json_data["name"]
  apollo_data["unit_size"] = json_data["unitSize"]
  if int(json_data["discountPercentage"])>0:
    apollo_data["discount_percentage"] = json_data["discountPercentage"]
    # apollo_data["discount_price"] = json_data["specialPrice"]
  apollo_data["discount_price"] = json_data["specialPrice"]
  return apollo_data


def pharmeasy(query):
  response = requests.get(f"https://pharmeasy.in/search/all?name={query}").text
  soup = BeautifulSoup(response, 'html.parser')
  product_card = soup.find_all(class_="ProductCard_medicineUnitContainer__cBkHl")
  if product_card!=[]:
    product_card = product_card[0]
    print("URL:","https://pharmeasy.in"+product_card.a["href"])
    print("Title:",product_card.h1.text)
    print("Pack Size:",product_card.find(class_="ProductCard_measurementUnit__hsZ2o").text)
    print("Price:",product_card.find(class_="ProductCard_priceContainer__dqj7Q").text)
    price = str(product_card.find(class_="ProductCard_priceContainer__dqj7Q").text).replace("MRP","").strip().split("₹")[-1]
    if "OFF" in price:
      price = round(float(price[:-6]),2)
    print(price)
    pharmeasy_data = {
        "url":"https://pharmeasy.in"+product_card.a["href"],
        "titile":product_card.h1.text,
        "pack_size":product_card.find(class_="ProductCard_measurementUnit__hsZ2o").text,
        "price":price
    }
    return pharmeasy_data