/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Navigate, useNavigate } from '@solidjs/router'
import toast from 'solid-toast'
import { Component, Show, createSignal } from 'solid-js'
import { useJoyIDProviderContext } from '../hooks/joyidProvider'
import { useAuthData } from '../hooks/localStorage'
import { buildERC20Data, getERC20Balance } from '../erc20'
import { useSendSuccessToast } from '../hooks/useSendSuccessToast'
import { parseEther } from 'ethers/lib/utils'
import { createQuery } from '@tanstack/solid-query'

const JOY_ERC20_CONTRACT_ADDRESS = '0xeF4489740eae514ed2E2FDe224aa054C606e3549'

export const SendERC20: Component = () => {
  const [toAddress, setToAddress] = createSignal(
    '0xA6eBeCE9938C3e1757bE3024D2296666d6F8Fc49'
  )
  const [amount, setAmount] = createSignal('0.01')
  const [contractAddress, setContractAddress] = createSignal(
    JOY_ERC20_CONTRACT_ADDRESS
  )
  const navi = useNavigate()
  const provider = useJoyIDProviderContext()
  const { authData } = useAuthData()
  const [isLoading, setIsLoading] = createSignal(false)
  const sendSuccessToast = useSendSuccessToast()
  const onReset = () => {
    setToAddress('0xA6eBeCE9938C3e1757bE3024D2296666d6F8Fc49')
    setAmount('0.01')
    setContractAddress(JOY_ERC20_CONTRACT_ADDRESS)
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
    const balance = parseEther(queryERC20.data?.toString() || '0')
    if (balance < parseEther(amount())) {
      toast.error('Insufficient balance', {
        position: 'bottom-center',
      })
      // eslint-disable-next-line solid/components-return-once
      return
    }
    setIsLoading(true)
    try {
      const signer = provider!.getSigner(authData.ethAddress)
      const tx = await signer.sendTransaction({
        to: contractAddress(),
        from: authData.ethAddress,
        value: '0',
        data: buildERC20Data(toAddress(), amount()),
        chainId: 2022,
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
      <Show when={authData.address} fallback={<Navigate href="/" />}>
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
                placeholder="0.01"
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
