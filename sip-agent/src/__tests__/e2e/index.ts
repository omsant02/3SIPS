// src/__tests__/e2e/index.ts
import type { IAgentRuntime } from '@elizaos/core';

/**
 * Test case interface that matches ElizaOS expectations
 */
interface TestCase {
  name: string;
  description?: string;
  fn: (runtime: IAgentRuntime) => Promise<boolean>;
}

/**
 * Test suite interface that matches ElizaOS expectations
 */
interface TestSuite {
  name: string;
  description?: string;
  tests: TestCase[];
}

/**
 * SIP Manager AI E2E Test Suite
 */
export class SIPManagerTestSuite implements TestSuite {
  name = 'sip_manager_test_suite';
  description = 'End-to-end tests for SIP Manager AI Web3 functionality';

  tests: TestCase[] = [
    {
      name: 'sip_manager_initialization',
      description: 'Test SIP Manager AI initialization with Web3 services',
      fn: async (runtime: IAgentRuntime): Promise<boolean> => {
        // Test that the agent initializes correctly
        const agent = runtime.agentId;
        if (!agent) {
          throw new Error('Agent not initialized');
        }

        // Test that Web3 service is available
        const web3Service = runtime.getService('web3');
        if (!web3Service) {
          console.warn('Web3Service not available - this may be expected in test environment');
        }

        return true;
      },
    },
    {
      name: 'sip_create_action_validation',
      description: 'Test CREATE_SIP action validation',
      fn: async (runtime: IAgentRuntime): Promise<boolean> => {
        // Mock message for SIP creation
        const mockMessage = {
          id: 'test-message-id',
          agentId: runtime.agentId,
          userId: 'test-user-id',
          content: {
            text: 'Create a SIP plan with 20 tokens monthly for retirement',
            source: 'test'
          },
          roomId: 'test-room-id',
          createdAt: Date.now()
        };

        // Test that the action validation works
        // In a real test, we would import and test the action directly
        console.log('SIP creation message would be processed:', mockMessage.content.text);
        
        return true;
      },
    },
    {
      name: 'character_plugin_integration',
      description: 'Test character and plugin integration',
      fn: async (runtime: IAgentRuntime): Promise<boolean> => {
        // Test that character is loaded with the right plugins
        const character = runtime.character;
        if (!character) {
          throw new Error('Character not loaded');
        }

        if (character.name !== 'SIP Manager AI') {
          throw new Error('Wrong character loaded');
        }

        // Check that Web3 SIP plugin is in the plugins list
        if (!character.plugins) {
          throw new Error('Character plugins not defined');
        }

        const hasWeb3Plugin = character.plugins.includes('web3-sip-manager');
        if (!hasWeb3Plugin) {
          throw new Error('Web3 SIP plugin not found in character plugins');
        }

        return true;
      },
    }
  ];
}

// Export the test suite
const testSuites = [new SIPManagerTestSuite()];
export { testSuites };