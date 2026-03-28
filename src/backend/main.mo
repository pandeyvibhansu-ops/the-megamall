import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Map "mo:core/Map";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";

actor {
  type Product = {
    id : Nat;
    name : Text;
    price : Nat;
    imageUrl : Text;
  };

  module Product {
    public func compare(p1 : Product, p2 : Product) : Order.Order {
      Nat.compare(p1.id, p2.id);
    };
  };

  let products = Map.fromIter<Nat, Product>([
    (
      0,
      {
        id = 0;
        name = "Classic White T-Shirt";
        price = 20_00;
        imageUrl = "https://th-thumbnailer.cdn-si-edu.com/KTh8Ifjra7pnv6bVsWwMr-vmLtQ=/1000x750/filters:no_upscale():focal(769x120:770x121)/https://tf-cmsv2-smithsonianmag-media.s3.amazonaws.com/filer_public/76/da/76da4c31-411e-484f-a0f7-9b42ff2ed036/white-tshirt-fabric-ink-drop-saatchi-art-kh.jpg";
      },
    ),
    (
      1,
      {
        id = 1;
        name = "Denim Jeans";
        price = 40_00;
        imageUrl = "https://cdn.britannica.com/41/234541-004-D7A74AF7/Jeans.jpg";
      },
    ),
    (
      2,
      {
        id = 2;
        name = "Leather Jacket";
        price = 150_00;
        imageUrl = "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=3858&auto=format&fit=crop";
      },
    ),
    (
      3,
      {
        id = 3;
        name = "Sneakers";
        price = 60_00;
        imageUrl = "https://t3.ftcdn.net/jpg/02/56/49/16/360_F_256491610_OZvQtpjH8SpCVOEsrBf129VAVRURUptJ.jpg";
      },
    ),
    (
      4,
      {
        id = 4;
        name = "Baseball Cap";
        price = 15_00;
        imageUrl = "https://t4.ftcdn.net/jpg/02/34/42/50/360_F_234425033_8psjoobHQe4q7ErzLGElI2Bo8UkOJv6z.jpg";
      },
    ),
    (
      5,
      {
        id = 5;
        name = "Hoodie";
        price = 35_00;
        imageUrl = "https://t4.ftcdn.net/jpg/03/00/29/04/360_F_300290448_1976a28KZWoqsJuDlQKbV2f9XLaJabsx.jpg";
      },
    ),
    (
      6,
      {
        id = 6;
        name = "Socks (5-pack)";
        price = 10_00;
        imageUrl = "https://contents.mediadecathlon.com/p2457848/02340909eb80d45e228c106894eebfdb/p2457848.jpg?format=auto&quality=70&f=650x0";
      },
    ),
    (
      7,
      {
        id = 7;
        name = "Backpack";
        price = 45_00;
        imageUrl = "https://t3.ftcdn.net/jpg/01/08/14/87/360_F_108148736_oLjulc666xD6byyzpo9vBAStVgK0WCmy.jpg";
      },
    ),
    (
      8,
      {
        id = 8;
        name = "Sunglasses";
        price = 25_00;
        imageUrl = "https://media.istockphoto.com/id/1148276266/photo/classic-sunglasses-isolated-on-white-background.jpg?s=612x612&w=0&k=20&c=7v0D9lkW8Nn_dQNbmmL1a44cJU_zzcpQiVNo0qtBWlE=";
      },
    ),
    (
      9,
      {
        id = 9;
        name = "Watch";
        price = 80_00;
        imageUrl = "https://www.icewatch.com/fr/ecom/product/017907-01.png";
      },
    ),
  ].values());

  var nextProductId = 10;
  let adminPassword = "1234";

  public query ({ caller }) func getAllProducts() : async [Product] {
    products.values().toArray().sort();
  };

  public shared ({ caller }) func addProduct(name : Text, price : Nat, imageUrl : Text) : async Nat {
    let product : Product = {
      id = nextProductId;
      name;
      price;
      imageUrl;
    };
    products.add(nextProductId, product);
    nextProductId += 1;
    product.id;
  };

  public shared ({ caller }) func deleteProduct(productId : Nat) : async () {
    if (products.containsKey(productId)) {
      products.remove(productId);
    } else {
      Runtime.trap("Product not found");
    };
  };

  public query ({ caller }) func checkAdminPassword(password : Text) : async Bool {
    Text.equal(password, adminPassword);
  };
};
