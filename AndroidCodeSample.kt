package com.clayton.scannur2.features.editPermissions.ui

import android.os.Bundle
import android.view.LayoutInflater
import android.view.MenuItem
import android.view.View
import android.view.ViewGroup
import androidx.activity.OnBackPressedCallback
import androidx.core.os.bundleOf
import androidx.fragment.app.setFragmentResult
import androidx.fragment.app.viewModels
import androidx.lifecycle.lifecycleScope
import androidx.navigation.fragment.findNavController
import androidx.navigation.fragment.navArgs
import androidx.recyclerview.widget.DefaultItemAnimator
import com.clayton.scannur2.databinding.FragmentPermissionsBinding
import com.clayton.scannur2.ui.base.BaseFragment
import com.clayton.scannur2.ui.base.recycler.DiffUtilDelegationCallback
import com.clayton.scannur2.ui.base.recycler.RecyclerDelegationAdapter
import com.clayton.scannur2.features.editPermissions.list.*
import kotlinx.coroutines.flow.collect

class FragmentPermissions : BaseFragment() {

    private val viewModel: PermissionsViewModel by viewModels()

    private var _binding: FragmentPermissionsBinding? = null
    private val binding get() = _binding!!

    private val args by navArgs<FragmentPermissionsArgs>()

    private val adapter by lazy {
        RecyclerDelegationAdapter(requireContext(), viewLifecycleOwner.lifecycleScope)
            .apply {
                addDelegate(PermissionCancelAdapterDelegate(requireContext()) {
                    handleNavigationBack()
                })
                addDelegate(
                    PermissionPreferenceAdapterDelegate(
                        requireContext(),
                        viewModel::onPermissionsPreferenceChanged
                    )
                )
                addDelegate(PermissionRoleTitleAdapterDelegate(requireContext()))
                addDelegate(PermissionSaveAdapterDelegate(requireContext()) {
                    viewModel.onSaveClicked()
                })
                addDelegate(PermissionSectionTitleAdapterDelegate(requireContext()))
                addDelegate(
                    PermissionTabSelectorAdapterDelegate(
                        requireContext(),
                        viewModel::onTabSwitch
                    )
                )
                addDelegate(PermissionsTimestampAdapterDelegate(requireContext()))
                addDelegate(
                    PermissionCostFieldAdapterDelegate(
                        requireContext(),
                        viewModel::onPermissionCostChanged
                    )
                )
                addDelegate(
                    PermissionCustomerVendorAdapterDelegate(
                        requireContext(),
                        viewModel::onPermissionCustomerVendorChanged
                    )
                )
                addDelegate(
                    PermissionCustomFieldAdapterDelegate(
                        requireContext(),
                        viewModel::onPermissionCustomFieldChanged
                    )
                )
                addDelegate(
                    PermissionDropDownAdapterDelegate(
                        requireContext(),
                        viewModel::onPermissionDropDownSwitchChanged,
                        viewModel::onPermissionDropDownSelectionChanged
                    )
                )
                addDelegate(
                    PermissionGroupAdapterDelegate(
                        requireContext(),
                        viewModel::omPermissionGroupSelectionChanged
                    )
                )
            }
    }

    private val diffCallbackBuilder by lazy {
        DiffUtilDelegationCallback.Builder()
            .delegate(PermissionCancelAdapterDelegate.diffUtilsCallback)
            .delegate(PermissionSectionTitleAdapterDelegate.diffUtilsCallback)
            .delegate(PermissionPreferenceAdapterDelegate.diffUtilsCallback)
            .delegate(PermissionRoleTitleAdapterDelegate.diffUtilsCallback)
            .delegate(PermissionTabSelectorAdapterDelegate.diffUtilsCallback)
            .delegate(PermissionsTimestampAdapterDelegate.diffUtilsCallback)
            .delegate(PermissionCostFieldAdapterDelegate.diffUtilsCallback)
            .delegate(PermissionCustomerVendorAdapterDelegate.diffUtilsCallback)
            .delegate(PermissionCustomFieldAdapterDelegate.diffUtilsCallback)
            .delegate(PermissionDropDownAdapterDelegate.diffUtilsCallback)
            .delegate(PermissionGroupAdapterDelegate.diffUtilsCallback)
            .delegate(PermissionSaveAdapterDelegate.diffUtilsCallback)
    }

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentPermissionsBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        bindRouter(viewModel)

        setupRecycler()
        observeData()
        backPressedListenerSetup()

        val rolePermissions = args.rolePermissions?.toList()
        viewModel.initScreen(args.roleTitle, args.timestamp, rolePermissions)

        initAppBar()
    }

    private fun observeData() {
        viewLifecycleOwner.lifecycleScope.launchWhenStarted {
            viewModel.permissionScreenFlow.collect {
                adapter.setItemsWithDiff(it, diffCallbackBuilder.build(adapter.getData(), it))
            }
        }

        viewModel.resultPermissionsEvent.observe(viewLifecycleOwner) {
            setFragmentResult(PERMISSIONS_SELECT_RESULT, bundleOf(SELECTED_PERMISSIONS to it))
            findNavController().popBackStack()
        }
    }

    private fun setupRecycler() {
        binding.vPermissionsRecycler.itemAnimator =
            DefaultItemAnimator().apply { supportsChangeAnimations = false }
        binding.vPermissionsRecycler.adapter = adapter
        binding.vPermissionsRecycler.addItemDecoration(PermissionsAdapterDecorator(requireContext()))
    }

    private fun initAppBar() {
        baseActivity.supportActionBar?.show()
        baseActivity.supportActionBar?.title = args.title
        baseActivity.supportActionBar?.setDisplayHomeAsUpEnabled(true)
        setHasOptionsMenu(true)
    }

    override fun onOptionsItemSelected(item: MenuItem): Boolean {
        if (item.itemId == android.R.id.home) {
            handleNavigationBack()
        }
        return super.onOptionsItemSelected(item)
    }

    private val backCallback = object : OnBackPressedCallback(true) {
        override fun handleOnBackPressed() {
            handleNavigationBack()
        }
    }

    private fun handleNavigationBack() {
        if (viewModel.isPreferencesIntact()) {
            findNavController().popBackStack()
        } else {
            viewModel.createExitDialog { findNavController().popBackStack() }
        }
    }

    private fun backPressedListenerSetup() {
        requireActivity()
            .onBackPressedDispatcher.addCallback(viewLifecycleOwner, backCallback)
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }

    companion object {
        const val PERMISSIONS_SELECT_RESULT = "selectedPermissionsResults"
        const val SELECTED_PERMISSIONS = "selectedPermissions"
    }
}
