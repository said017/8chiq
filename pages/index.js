import Head from 'next/head'
import Image from 'next/image'
import { getAllMemes } from "@content/fetcher"
import { MemeList, MemeCard } from '@components/ui'
import { BaseLayout } from '@components/ui/layout'
import { useWeb3 } from '@components/provider'
import {useEffect, useState} from 'react'
import { useWalletInfo } from '@components/hooks/web3'
import { Loader, ActiveLinkNavCat } from "@components/ui/common"
import { likeMeme } from '@utils/likeMeme'
import { dislikeMeme } from '@utils/dislikeMeme'


export default function Home() {

  const [memes, setMemes] = useState([])
  const { web3, isLoading, marketContract, requireInstall } = useWeb3()
  const [loadingState, setLoadingState] = useState('not-loaded')
  const { account, network, canPurchaseMeme } = useWalletInfo()

  // console.log(marketContract)
  // console.log(nftContract)
  
 
  useEffect(()=> {
    if (!isLoading) {
      console.log(marketContract)
      // console.log(nftContract)
      loadNFTs()
    } 
  }, [isLoading, canPurchaseMeme, account.data, network.isSupported])

  async function loadNFTs() {
    setLoadingState('not-loaded')
    if (requireInstall) {
      console.log("sempet masuk sini? karena require install")
      setLoadingState('loaded')
      return
    }
    
    if (!network.isSupported && network.data != null) {
      console.log("sempet masuk sini? karena network is supported")
      console.log(network)
      setLoadingState('loaded')
      return
    }
    const { data } = await getAllMemes(web3, marketContract, account)
    setMemes(data)
    console.log(memes)
    setLoadingState('loaded')
  }

  const likeOrDislike = async (tokenId, like = true) => {
    // alert(JSON.stringify(order))
    setLoadingState('liking')
    console.log('masuk like or dislike')
    console.log(marketContract)
    const test = await getLikeStatus(tokenId)
    if (like) {

      const { data } = await likeMeme(marketContract, account, tokenId)

    } else {

      const { data } = await dislikeMeme(marketContract, account, tokenId)
      
    }
    setLoadingState('loaded')
    loadNFTs()
  }
  
  async function getLikeStatus(tokenId) {
    return await marketContract.methods.getLikeStatus(tokenId).call()
  }

  
  return (
    <div>
      <Head>
        <title>8Chiq : Actually Funny NFTs!</title>
        <meta name="description" content="Prime properties" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
        {/* recent properties section */}

        {  (loadingState === 'loaded' && !memes.length) ? 
            (requireInstall || !network.isSupported) ? 
           <h1 className='px-20 py-7 text-4x1'>Please Install Metamask or Changed to Goerli Test Network</h1> : <h1 className='px-20 py-7 text-4x1'>No NFts in marketplace</h1> :
           loadingState === 'not-loaded' ? 
            <div className="w-full flex justify-center">
              <Loader/>
            </div> :
            <>

            <div className="mt-4 flex text-gray-700 max-w-2xl mx-auto">
                  <ActiveLinkNavCat href="/interest/funny">
                      <a className='px-2'>Funny</a>
                  </ActiveLinkNavCat>
                  <ActiveLinkNavCat href="/interest/anime">
                      <a className='px-2'>Anime</a>
                  </ActiveLinkNavCat>                 
                  <ActiveLinkNavCat href="/interest/blockchain">
                      <a className='px-2'>Blockchain</a>
                  </ActiveLinkNavCat>
                  <ActiveLinkNavCat href="/interest/cat">
                      <a className='px-2'>Cat</a>
                  </ActiveLinkNavCat>
                  <ActiveLinkNavCat href="/interest/chiq">
                      <a className='px-2'>Chiq</a>
                  </ActiveLinkNavCat>                  
            </div>
            
            <MemeList memes={memes}>

              {/* Memes Cards */}

              {meme =>
            <MemeCard
              key={meme.id}
              meme={meme}
              disabledButton={(!canPurchaseMeme || loadingState === "liking" || isLoading)}
              onClickButton={() => likeOrDislike(meme.id)}
              onClickDislikeButton={() => likeOrDislike(meme.id, false)}
              loadingStateButton={loadingState}
            />
            }
            </MemeList>
          </>
        }
        {/* end cards section */}


    </div>
  )
}

// export async function getStaticProps({params}) {
//   const { web3, nftContract, marketContract } = useWeb3()
//   const { data } = await getAllMemes( web3, nftContract, marketContract)
  
//   return {
//     props: {
//       memes: data
//     }
//   }
// }

Home.Layout = BaseLayout
