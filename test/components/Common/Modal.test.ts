/**
 * Modal Component — UI Tests
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import Modal from '~/components/Common/Modal.vue'

const iconStub = { template: '<span />' }

describe('Modal.vue', () => {
  const mountModal = (props = {}, slots = {}) => {
    return mount(Modal, {
      props: { show: false, ...props },
      slots,
      global: {
        stubs: {
          Teleport: true,
          Transition: false,
          X: iconStub
        }
      }
    })
  }

  it('renders nothing when show=false', () => {
    const wrapper = mountModal({ show: false })
    expect(wrapper.find('.fixed').exists()).toBe(false)
  })

  it('renders modal content when show=true', () => {
    const wrapper = mountModal({ show: true })
    expect(wrapper.find('.fixed').exists()).toBe(true)
  })

  it('emits close event when backdrop is clicked', async () => {
    const wrapper = mountModal({ show: true })
    // Backdrop is the first div with bg-[#0b0f15]/80 class
    const backdrop = wrapper.find('.backdrop-blur-sm')
    await backdrop.trigger('click')
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('emits close event when X button is clicked', async () => {
    const wrapper = mountModal({ show: true })
    // X button is the close button in the header
    const closeBtn = wrapper.find('button')
    await closeBtn.trigger('click')
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('renders named slots (header, body, footer)', () => {
    const wrapper = mountModal(
      { show: true },
      {
        header: () => 'Test Header',
        body: () => 'Test Body',
        footer: () => 'Test Footer'
      }
    )
    expect(wrapper.text()).toContain('Test Header')
    expect(wrapper.text()).toContain('Test Body')
    expect(wrapper.text()).toContain('Test Footer')
  })
})
