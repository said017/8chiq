
import axios from 'axios'

export async function getOnCatMemes(web3, marketContract, address, category) {


  // console.log('masuk ke get data')
  // console.log(marketContract.methods)
  console.log("data category market masuk")
  console.log(marketContract)
  
  let data = await marketContract.methods.fetchMarketCategory(category).call()
  console.log("data category market")
  console.log(data)
  data = data.filter(item => item.isExist)
  const items = await Promise.all(data.map(async i => {
    // console.log('masuk sini ga sih')
    // console.log(i)
    const tokenUri = await marketContract.methods.tokenURI(i.tokenId).call()
    // we want get the token metadata - json 
    const meta = await axios.get(tokenUri)
    let price
    if (i.price === "0") {
      price = "0"
    } else {
      price = web3.utils.fromWei(i.price.toString(), 'ether')
    }
    console.log(`ini address ${address.data}`)
    console.log(`ini owner ${i.owner}`)
    console.log(`sama ga mereka? ${(address.data === i.seller)}`)

    // start of calculating time to show
    let dateNow = new Date()
    let dateCreate = new Date(Number(i.timeCreated+"000"))

    let Difference_In_Time = dateNow.getTime() - dateCreate.getTime()

    // calculate in minutes first
    let Difference_In_minutes = Math.round(Difference_In_Time / (1000 * 60))
    let usedTime = `${Difference_In_minutes}m`

    if (Difference_In_minutes> 60) {

      // now calculate in hour
      let Difference_In_hour = Math.round(Difference_In_Time / (1000 * 3600))
      usedTime =`${Difference_In_hour}h`

      if (Difference_In_hour > 24) {

        // now calculate in days
        let Difference_In_days = Math.round(Difference_In_Time / (1000 * 3600 * 24))
        usedTime = `${Difference_In_days}d`
      }

    }


    // get the like and dislike data


    
    let item = {
      price,
      id: i.tokenId,
      seller: i.seller,
      owner: i.owner,
      img: meta.data.image, 
      title: meta.data.name,
      category: meta.data.category,
      onSale : (!i.sold && !(address.data === i.seller)),
      like: i.likes,
      dislike: i.dislikes,
      age: usedTime,
      comment: "297",
      description: meta.data.description
    }
    return item
  }))


  
  console.log('ada dong datanya sih')
  console.log(items)
  const count = await marketContract.methods.getCount().call()
  console.log(`jumlah count : ${count}`)
  
  

  return {
    data: items,
    memeMap: items.reduce((a, c, i) => {
      a[c.id] = c
      a[c.id].index = i
      return a
    }, {})
  }
}
