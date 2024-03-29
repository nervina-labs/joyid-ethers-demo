/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Navigate, useNavigate } from '@solidjs/router'
import toast from 'solid-toast'
import { Component, Show, createSignal } from 'solid-js'
import { createProvider, createSigner } from '../hooks/provider'
import { useAuthData } from '../hooks/localStorage'
import { buildERC20Data, getERC20Balance } from '../erc20'
import { useSendSuccessToast } from '../hooks/useSendSuccessToast'
import { createQuery } from '@tanstack/solid-query'
import {
  DEFAULT_ERC20_CONTRACT_ADDRESS,
  DEFAULT_SEND_ADDRESS,
} from '../constant'
import { parseUnits } from 'ethers/lib/utils'

export const SendERC20: Component = () => {
  const [toAddress, setToAddress] = createSignal(DEFAULT_SEND_ADDRESS)
  const [amount, setAmount] = createSignal('0.01')
  const [decimals, setDecimals] = createSignal(6)
  const [contractAddress, setContractAddress] = createSignal(
    DEFAULT_ERC20_CONTRACT_ADDRESS
  )
  const navi = useNavigate()
  const provider = createProvider()
  const { authData } = useAuthData()
  const signer = createSigner(authData.ethAddress, provider)
  const [isLoading, setIsLoading] = createSignal(false)
  const sendSuccessToast = useSendSuccessToast()
  const onReset = () => {
    setToAddress(DEFAULT_SEND_ADDRESS)
    setAmount('0.01')
    setDecimals(6)
    setContractAddress(DEFAULT_ERC20_CONTRACT_ADDRESS)
  }

  const queryERC20 = createQuery(
    () => ['erc20-balance', authData.ethAddress],
    () => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return getERC20Balance(authData.ethAddress, provider)
    },
    {
      retry: 3,
      enabled: !!authData.ethAddress,
    }
  )

  const onSend = async () => {
    const balance = queryERC20.data
    if (balance == null) {
      // eslint-disable-next-line solid/components-return-once
      return
    }
    const sendAmount = parseUnits(amount(), decimals())
    if (
      contractAddress() === DEFAULT_ERC20_CONTRACT_ADDRESS &&
      balance.lt(sendAmount)
    ) {
      toast.error('Insufficient balance', {
        position: 'bottom-center',
      })
      // eslint-disable-next-line solid/components-return-once
      return
    }
    setIsLoading(true)
    try {
      const tx = await signer.sendTransaction({
        to: contractAddress(),
        from: authData.ethAddress,
        value: '0',
        data: buildERC20Data(toAddress(), sendAmount),
      })

      sendSuccessToast(tx.hash)
    } catch (error) {
      const formattedError =
        error instanceof Error ? error.message : JSON.stringify(error)
      toast.error(<div class="break-all">{formattedError}</div>, {
        position: 'bottom-center',
        duration: 5000,
      })
      console.log(error)
      //
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Show when={authData.ethAddress} fallback={<Navigate href="/" />}>
        <section class="flex-col flex items-center">
          <div class="form-control w-80">
            <label class="label">
              <span class="label-text">To Address</span>
            </label>
            <textarea
              class="textarea textarea-bordered textarea-md w-full"
              placeholder="To Address"
              value={toAddress()}
              onInput={(e) => setToAddress(e.target.value)}
            />
          </div>
          <div class="form-control w-80 mt-4">
            <label class="label">
              <span class="label-text">Enter amount</span>
            </label>
            <label class="input-group">
              <input
                type="number"
                class="input input-bordered w-full"
                value={amount()}
                onInput={(e) => setAmount(e.target.value)}
              />
              <span>ERC20</span>
            </label>
          </div>
          <div class="collapse collapse-arrow w-80 mt-4">
            <input type="checkbox" />
            <div class="collapse-title px-0">
              <label class="label">
                <span class="label-text">Contract Address</span>
              </label>
            </div>
            <div class="collapse-content px-0">
              <textarea
                class="textarea textarea-bordered textarea-md w-full"
                placeholder="Contract Address"
                value={contractAddress()}
                onInput={(e) => setContractAddress(e.target.value)}
              />
            </div>
          </div>
          <div class="collapse collapse-arrow w-80 mt-1">
            <input type="checkbox" />
            <div class="collapse-title px-0">
              <label class="label">
                <span class="label-text">Decimals</span>
              </label>
            </div>
            <div class="collapse-content px-0">
              <input
                type="number"
                class="input input-bordered input-md w-full"
                placeholder="Contract Address"
                value={decimals()}
                onInput={(e) => {
                  setDecimals(Number(e.target.value))
                }}
              />
            </div>
          </div>
          <button
            class="btn btn-wide btn-primary mt-12"
            onClick={onSend}
            classList={{ loading: isLoading() || queryERC20.isLoading }}
          >
            Send
          </button>
          <button
            class="btn btn-wide btn-outline btn-secondary mt-8"
            onClick={onReset}
          >
            Reset
          </button>
          <button
            class="btn btn-wide btn-outline mt-8"
            onClick={() => {
              navi(-1)
            }}
          >{`<< Go Home`}</button>
        </section>
      </Show>
    </>
  )
}
